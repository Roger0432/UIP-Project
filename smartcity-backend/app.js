// javascript
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hola, el meu backend amb Express!");
});

const PORT = process.env.PORT || 5000;

// almacenamiento en memoria de ejemplo
let nextIncidentId = 1;
const incidents = [];

// helpers
const findIncidentIndex = (id) => incidents.findIndex((i) => i.id === id);
const isAdmin = (req) => req.headers["x-admin"] === "true";
const isAuth = (req) => !!req.headers["authorization"];

// POST /api/incidents - Create incident
app.post("/api/incidents", (req, res) => {
    try {
        if (!isAuth(req)) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const { title, description, location, reporter, status } = req.body;
        if (!title || !description || !location || !reporter) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        const newIncident = {
            id: nextIncidentId++,
            title,
            description,
            location,
            reporter,
            status: status || "open",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        incidents.push(newIncident);
        return res.status(201).json(newIncident);
    } catch (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET /api/incidents - Retrieve with filters
app.get("/api/incidents", (req, res) => {
    try {
        let results = [...incidents];

        // filtros soportados: status, reporter, from, to, location
        const { status, reporter, from, to, location, page = 1, limit = 10 } = req.query;

        if (status) {
            results = results.filter((i) => i.status === status);
        }
        if (reporter) {
            results = results.filter((i) => String(i.reporter) === String(reporter));
        }
        if (location) {
            results = results.filter((i) => String(i.location) === String(location));
        }
        if (from) {
            const fromDate = new Date(from);
            if (!isNaN(fromDate)) {
                results = results.filter((i) => new Date(i.createdAt) >= fromDate);
            } else {
                return res.status(400).json({ error: "Fecha 'from' inválida" });
            }
        }
        if (to) {
            const toDate = new Date(to);
            if (!isNaN(toDate)) {
                results = results.filter((i) => new Date(i.createdAt) <= toDate);
            } else {
                return res.status(400).json({ error: "Fecha 'to' inválida" });
            }
        }

        // paginación simple
        const p = Math.max(1, parseInt(page, 10) || 1);
        const l = Math.max(1, parseInt(limit, 10) || 10);
        const start = (p - 1) * l;
        const paged = results.slice(start, start + l);

        return res.status(200).json({
            meta: { total: results.length, page: p, limit: l },
            data: paged,
        });
    } catch (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// GET /api/incidents/:id - Get details
app.get("/api/incidents/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const incident = incidents.find((i) => i.id === id);
        if (!incident) {
            return res.status(404).json({ error: "Incidencia no encontrada" });
        }
        return res.status(200).json(incident);
    } catch (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// PUT /api/incidents/:id - Update status (o campos permitidos)
app.put("/api/incidents/:id", (req, res) => {
    try {
        if (!isAuth(req)) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const id = parseInt(req.params.id, 10);
        const idx = findIncidentIndex(id);
        if (idx === -1) {
            return res.status(404).json({ error: "Incidencia no encontrada" });
        }

        const allowedStatuses = ["open", "in_progress", "closed"];
        const { status, title, description, location } = req.body;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: "Estado no válido" });
        }

        // sólo actualizar campos permitidos
        if (status) incidents[idx].status = status;
        if (title) incidents[idx].title = title;
        if (description) incidents[idx].description = description;
        if (location) incidents[idx].location = location;
        incidents[idx].updatedAt = new Date().toISOString();

        return res.status(200).json(incidents[idx]);
    } catch (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

// DELETE /api/incidents/:id - Remove (admin)
app.delete("/api/incidents/:id", (req, res) => {
    try {
        if (!isAuth(req) || !isAdmin(req)) {
            return res.status(401).json({ error: "No autorizado (se requiere admin)" });
        }

        const id = parseInt(req.params.id, 10);
        const idx = findIncidentIndex(id);
        if (idx === -1) {
            return res.status(404).json({ error: "Incidencia no encontrada" });
        }

        const removed = incidents.splice(idx, 1)[0];
        return res.status(200).json({ message: "Incidencia eliminada", incident: removed });
    } catch (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor executant-se al port ${PORT}`);
});
