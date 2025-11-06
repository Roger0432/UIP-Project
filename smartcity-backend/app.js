require('dotenv').config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Ensure database configuration exists
if (!DATABASE_URL) {
    console.error("ERROR: DATABASE_URL not found in environment variables");
    console.error("Make sure you have a .env file with DATABASE_URL set");
    process.exit(1);
}

// Configure connection pool
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Try to connect to the database and check the table
async function testDatabaseConnection() {
    console.log("Attempting to connect to the database...");
    console.log("Host:", DATABASE_URL.split("@")[1]?.split("/")[0] || "Unavailable");

    try {
        const client = await pool.connect();
        console.log("Database connection successful");

        // Check if the incidents table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'incidents'
            );
        `);

        if (tableCheck.rows[0].exists) {
            console.log("Table 'incidents' exists");

            // Count existing records
            const countResult = await client.query("SELECT COUNT(*) FROM incidents");
            console.log(`Current records in table: ${countResult.rows[0].count}`);
        } else {
            console.warn("Table 'incidents' does not exist");
        }

        client.release();
        return true;
    } catch (err) {
        console.error("Error connecting to the database:");
        console.error("  Message:", err.message);
        console.error("  Code:", err.code);

        if (err.code === 'ENOTFOUND') {
            console.error("  → Could not resolve database host");
        } else if (err.code === 'ECONNREFUSED') {
            console.error("  → Connection refused. Check if the server is running");
        } else if (err.code === '28P01') {
            console.error("  → Authentication failed. Check username and password");
        } else if (err.code === '3D000') {
            console.error("  → Specified database does not exist");
        }

        console.error("\nSuggestions:");
        console.error("  1. Verify DATABASE_URL in .env is correct");
        console.error("  2. Check your internet connection");
        console.error("  3. Ensure the Neon DB instance is running and accessible");

        return false;
    }
}

// Pool error handling
pool.on('error', (err, client) => {
    console.error('Unexpected error in the connection pool:', err);
});

app.get("/", (req, res) => {
    res.send("Hello, this is the Express backend.");
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
        if (!isAuth(req)) return res.status(401).json({ error: "Unauthorized" });

        const { title, description, location, reporter, status } = req.body;
        if (!title || !description || !location || !reporter) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const q = `INSERT INTO incidents (title, description, location, reporter, status, created_at, updated_at)
                   VALUES ($1,$2,$3,$4,$5, now(), now()) RETURNING *`;
        const values = [title, description, location, reporter, status || "open"];
        const { rows } = await pool.query(q, values);
        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
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
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/incidents/:id - Get details
app.get("/api/incidents/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { rows } = await pool.query("SELECT * FROM incidents WHERE id = $1", [id]);
        if (!rows[0]) return res.status(404).json({ error: "Incident not found" });
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
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/incidents/:id - Update fields
app.put("/api/incidents/:id", async (req, res) => {
    try {
        if (!isAuth(req)) return res.status(401).json({ error: "Unauthorized" });

        const id = parseInt(req.params.id, 10);
        const allowedStatuses = ["open", "in_progress", "closed"];
        const { status, title, description, location } = req.body;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const fields = [];
        const params = [];
        let idx = 1;
        if (status) { fields.push(`status = $${idx++}`); params.push(status); }
        if (title) { fields.push(`title = $${idx++}`); params.push(title); }
        if (description) { fields.push(`description = $${idx++}`); params.push(description); }
        if (location) { fields.push(`location = $${idx++}`); params.push(location); }
        if (!fields.length) return res.status(400).json({ error: "No fields to update" });

        fields.push(`updated_at = now()`);
        const q = `UPDATE incidents SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;
        params.push(id);

        const { rows } = await pool.query(q, params);
        if (!rows[0]) return res.status(404).json({ error: "Incident not found" });

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
        return res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/incidents/:id - Remove (admin only)
app.delete("/api/incidents/:id", async (req, res) => {
    try {
        if (!isAuth(req) || !isAdmin(req)) {
            return res.status(401).json({ error: "Unauthorized (admin required)" });
        }

        const id = parseInt(req.params.id, 10);
        const { rows } = await pool.query("DELETE FROM incidents WHERE id = $1 RETURNING *", [id]);
        if (!rows[0]) return res.status(404).json({ error: "Incident not found" });

        const r = rows[0];
        return res.status(200).json({ message: "Incident deleted", incident: {
                id: r.id, title: r.title, description: r.description, location: r.location, reporter: r.reporter, status: r.status
            }});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Return local network IPv4 address or localhost
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Start server only if DB connection is successful
async function startServer() {
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
        console.error("Server will not start due to database connection issues");
        process.exit(1);
    }

    app.listen(PORT, HOST, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Local: http://localhost:${PORT}`);
        console.log(`Network: http://${getLocalIP()}:${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

startServer();
