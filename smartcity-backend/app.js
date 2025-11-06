require('dotenv').config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Validación de configuración de base de datos
if (!DATABASE_URL) {
    console.error("❌ ERROR: No se encontró DATABASE_URL en las variables de entorno");
    console.error("Asegúrate de tener un archivo .env con la variable DATABASE_URL");
    process.exit(1);
}

// Configuración del pool de conexiones
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Función para probar la conexión a la base de datos
async function testDatabaseConnection() {
    console.log("🔄 Intentando conectar a la base de datos...");
    console.log("📍 Host:", DATABASE_URL.split("@")[1]?.split("/")[0] || "No disponible");

    try {
        const client = await pool.connect();
        console.log("✅ Conexión a la base de datos exitosa");

        // Verificar si la tabla existe
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'incidents'
            );
        `);

        if (tableCheck.rows[0].exists) {
            console.log("✅ La tabla 'incidents' existe en la base de datos");

            // Contar registros existentes
            const countResult = await client.query("SELECT COUNT(*) FROM incidents");
            console.log(`📊 Registros actuales en la tabla: ${countResult.rows[0].count}`);
        } else {
            console.warn("⚠️  La tabla 'incidents' NO existe. ");
        }

        client.release();
        return true;
    } catch (err) {
        console.error("❌ Error al conectar con la base de datos:");
        console.error("   Mensaje:", err.message);
        console.error("   Código:", err.code);

        if (err.code === 'ENOTFOUND') {
            console.error("   → No se pudo resolver el host de la base de datos");
        } else if (err.code === 'ECONNREFUSED') {
            console.error("   → La conexión fue rechazada. Verifica que el servidor esté activo");
        } else if (err.code === '28P01') {
            console.error("   → Autenticación fallida. Verifica usuario y contraseña");
        } else if (err.code === '3D000') {
            console.error("   → La base de datos especificada no existe");
        }

        console.error("\n💡 Sugerencias:");
        console.error("   1. Verifica que DATABASE_URL en .env sea correcta");
        console.error("   2. Comprueba tu conexión a internet");
        console.error("   3. Asegúrate de que Neon DB esté activo y accesible");

        return false;
    }
}

// Manejo de errores del pool
pool.on('error', (err, client) => {
    console.error('❌ Error inesperado en el pool de conexiones:', err);
});

app.get("/", (req, res) => {
    res.send("Hola, el meu backend amb Express!");
});

// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        res.status(200).json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(503).json({
            status: "error",
            database: "disconnected",
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

const isAdmin = (req) => req.headers["x-admin"] === "true";
const isAuth = (req) => !!req.headers["authorization"];

// POST /api/incidents - Create incident
app.post("/api/incidents", async (req, res) => {
    try {
        if (!isAuth(req)) return res.status(401).json({ error: "No autorizado" });

        const { title, description, location, reporter, status } = req.body;
        if (!title || !description || !location || !reporter) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const q = `INSERT INTO incidents (title, description, location, reporter, status, created_at, updated_at)
                   VALUES ($1,$2,$3,$4,$5, now(), now()) RETURNING *`;
        const values = [title, description, location, reporter, status || "open"];
        const { rows } = await pool.query(q, values);
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET /api/incidents - Retrieve with filters
app.get("/api/incidents", async (req, res) => {
    try {
        const { status, reporter, from, to, location, page = 1, limit = 10 } = req.query;
        const filters = [];
        const params = [];
        let idx = 1;

        if (status) { filters.push(`status = $${idx++}`); params.push(status); }
        if (reporter) { filters.push(`reporter = $${idx++}`); params.push(reporter); }
        if (location) { filters.push(`location = $${idx++}`); params.push(location); }
        if (from) { filters.push(`created_at >= $${idx++}`); params.push(new Date(from)); }
        if (to) { filters.push(`created_at <= $${idx++}`); params.push(new Date(to)); }

        const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
        const p = Math.max(1, parseInt(page, 10) || 1);
        const l = Math.max(1, parseInt(limit, 10) || 10);
        const offset = (p - 1) * l;

        const q = `SELECT *, COUNT(*) OVER() AS total
                   FROM incidents
                   ${where}
                   ORDER BY created_at DESC
                   LIMIT $${idx++} OFFSET $${idx++}`;
        params.push(l, offset);

        const { rows } = await pool.query(q, params);
        const total = rows.length ? parseInt(rows[0].total, 10) : 0;
        return res.status(200).json({
            meta: { total, page: p, limit: l },
            data: rows.map(r => {
                return {
                    id: r.id,
                    title: r.title,
                    description: r.description,
                    location: r.location,
                    reporter: r.reporter,
                    status: r.status,
                    createdAt: r.created_at,
                    updatedAt: r.updated_at
                };
            })
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET /api/incidents/:id - Get details
app.get("/api/incidents/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { rows } = await pool.query("SELECT * FROM incidents WHERE id = $1", [id]);
        if (!rows[0]) return res.status(404).json({ error: "Incidencia no encontrada" });
        const r = rows[0];
        return res.status(200).json({
            id: r.id,
            title: r.title,
            description: r.description,
            location: r.location,
            reporter: r.reporter,
            status: r.status,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// PUT /api/incidents/:id - Update status (o campos permitidos)
app.put("/api/incidents/:id", async (req, res) => {
    try {
        if (!isAuth(req)) return res.status(401).json({ error: "No autorizado" });

        const id = parseInt(req.params.id, 10);
        const allowedStatuses = ["open", "in_progress", "closed"];
        const { status, title, description, location } = req.body;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Estado no válido" });
        }

        const fields = [];
        const params = [];
        let idx = 1;
        if (status) { fields.push(`status = $${idx++}`); params.push(status); }
        if (title) { fields.push(`title = $${idx++}`); params.push(title); }
        if (description) { fields.push(`description = $${idx++}`); params.push(description); }
        if (location) { fields.push(`location = $${idx++}`); params.push(location); }
        if (!fields.length) return res.status(400).json({ error: "No hay campos para actualizar" });

        fields.push(`updated_at = now()`);
        const q = `UPDATE incidents SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await pool.query(q, params);
        if (!rows[0]) return res.status(404).json({ error: "Incidencia no encontrada" });

        const r = rows[0];
        return res.status(200).json({
            id: r.id,
            title: r.title,
            description: r.description,
            location: r.location,
            reporter: r.reporter,
            status: r.status,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// DELETE /api/incidents/:id - Remove (admin)
app.delete("/api/incidents/:id", async (req, res) => {
    try {
        if (!isAuth(req) || !isAdmin(req)) {
            return res.status(401).json({ error: "No autorizado (se requiere admin)" });
        }

        const id = parseInt(req.params.id, 10);
        const { rows } = await pool.query("DELETE FROM incidents WHERE id = $1 RETURNING *", [id]);
        if (!rows[0]) return res.status(404).json({ error: "Incidencia no encontrada" });

        const r = rows[0];
        return res.status(200).json({ message: "Incidencia eliminada", incident: {
                id: r.id, title: r.title, description: r.description, location: r.location, reporter: r.reporter, status: r.status
            }});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

const PORT = process.env.PORT || 5000;

// Iniciar servidor solo si la conexión a BD es exitosa
async function startServer() {
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
        console.error("\n❌ No se pudo iniciar el servidor debido a problemas de conexión con la base de datos");
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`\n🚀 Servidor ejecutándose en el puerto ${PORT}`);
        console.log(`📍 http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
}

startServer();
