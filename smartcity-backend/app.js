require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const cors = require("cors");
app.use(cors());
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
  ssl: DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Try to connect to the database and check the table
async function testDatabaseConnection() {
  console.log("Attempting to connect to the database...");
  console.log(
    "Host:",
    DATABASE_URL.split("@")[1]?.split("/")[0] || "Unavailable"
  );

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

    if (err.code === "ENOTFOUND") {
      console.error("  → Could not resolve database host");
    } else if (err.code === "ECONNREFUSED") {
      console.error("  → Connection refused. Check if the server is running");
    } else if (err.code === "28P01") {
      console.error("  → Authentication failed. Check username and password");
    } else if (err.code === "3D000") {
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
pool.on("error", (err, client) => {
  console.error("Unexpected error in the connection pool:", err);
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
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

const isAdmin = (req) => req.headers["x-admin"] === "true";
const isAuth = (req) => !!req.headers["authorization"];

// POST /api/incidents - Create incident
app.post("/api/incidents", async (req, res) => {
  try {
    if (!isAuth(req)) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, location, reporter, status, photos } = req.body;
    if (!title || !description || !location || !reporter) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const photosArray = Array.isArray(photos) ? photos : [];

    const q = `INSERT INTO incidents
                 (title, description, location, reporter, status, photos, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6, now(), now())
               RETURNING *`;
    const values = [
      title,
      description,
      location,
      reporter,
      status || "open",
      JSON.stringify(photosArray),
    ];

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
    const {
      status,
      reporter,
      from,
      to,
      location,
      page = 1,
      limit = 10,
    } = req.query;
    const filters = [];
    const params = [];
    let idx = 1;

    if (status) {
      filters.push(`status = $${idx++}`);
      params.push(status);
    }
    if (reporter) {
      filters.push(`reporter = $${idx++}`);
      params.push(reporter);
    }
    if (location) {
      filters.push(`location = $${idx++}`);
      params.push(location);
    }
    if (from) {
      filters.push(`created_at >= $${idx++}`);
      params.push(new Date(from));
    }
    if (to) {
      filters.push(`created_at <= $${idx++}`);
      params.push(new Date(to));
    }

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
      data: rows.map((r) => {
        return {
          id: r.id,
          title: r.title,
          description: r.description,
          location: r.location,
          reporter: r.reporter,
          status: r.status,
          photos: r.photos || [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      }),
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
    const { rows } = await pool.query("SELECT * FROM incidents WHERE id = $1", [
      id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: "Incident not found" });
    const r = rows[0];
    return res.status(200).json({
      id: r.id,
      title: r.title,
      description: r.description,
      location: r.location,
      reporter: r.reporter,
      status: r.status,
      photos: r.photos || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
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
    const allowedStatuses = [
      "waiting",
      "accepted",
      "denied",
      "in_progress",
      "finished",
    ];
    const { status, title, description, location } = req.body;

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const fields = [];
    const params = [];
    let idx = 1;
    if (status) {
      fields.push(`status = $${idx++}`);
      params.push(status);
    }
    if (title) {
      fields.push(`title = $${idx++}`);
      params.push(title);
    }
    if (description) {
      fields.push(`description = $${idx++}`);
      params.push(description);
    }
    if (location) {
      fields.push(`location = $${idx++}`);
      params.push(location);
    }
    if (!fields.length)
      return res.status(400).json({ error: "No fields to update" });

    fields.push(`updated_at = now()`);
    const q = `UPDATE incidents SET ${fields.join(
      ", "
    )} WHERE id = $${idx} RETURNING *`;
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
      photos: r.photos || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
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
    const { rows } = await pool.query(
      "DELETE FROM incidents WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Incident not found" });

    const r = rows[0];
    return res.status(200).json({
      message: "Incident deleted",
      incident: {
        id: r.id,
        title: r.title,
        description: r.description,
        location: r.location,
        reporter: r.reporter,
        status: r.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/profile/:userId - Get user profile
app.get("/api/profile/:userId", async (req, res) => {
  try {
    if (!isAuth(req)) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.params.userId;

    // First, check if users table exists, if not create it
    const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            );
        `);

    if (!tableCheck.rows[0].exists) {
      // Create users table if it doesn't exist
      await pool.query(`
                CREATE TABLE users (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    role VARCHAR(50) DEFAULT 'citizen',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);
      console.log("Created 'users' table");
    }

    // Try to get user profile
    const { rows } = await pool.query(
      "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );

    if (!rows[0]) {
      // If user doesn't exist, return a default profile structure
      return res.status(404).json({
        error: "User not found",
        message: "Please update your profile to create it",
      });
    }

    const user = rows[0];
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    console.error("Error getting profile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profile/:userId - Update user profile
app.put("/api/profile/:userId", async (req, res) => {
  try {
    if (!isAuth(req)) return res.status(401).json({ error: "Unauthorized" });

    const userId = req.params.userId;
    const { name, email, phone, role } = req.body;

    // Validate at least one field is provided
    if (!name && !email && !phone && !role) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Check if user exists
    const checkUser = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (!checkUser.rows[0]) {
      // Create new user if doesn't exist
      const insertQuery = `
                INSERT INTO users (id, name, email, phone, role, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                RETURNING id, name, email, phone, role, created_at, updated_at
            `;
      const { rows } = await pool.query(insertQuery, [
        userId,
        name || "User",
        email || `${userId}@example.com`,
        phone || "",
        role || "citizen",
      ]);

      const user = rows[0];
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      });
    }

    // Update existing user
    const fields = [];
    const params = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      params.push(name);
    }
    if (email) {
      fields.push(`email = $${idx++}`);
      params.push(email);
    }
    if (phone !== undefined) {
      fields.push(`phone = $${idx++}`);
      params.push(phone);
    }
    if (role) {
      fields.push(`role = $${idx++}`);
      params.push(role);
    }

    fields.push(`updated_at = NOW()`);
    params.push(userId);

    const updateQuery = `
            UPDATE users 
            SET ${fields.join(", ")} 
            WHERE id = $${idx}
            RETURNING id, name, email, phone, role, created_at, updated_at
        `;

    const { rows } = await pool.query(updateQuery, params);
    const user = rows[0];

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (err) {
    console.error("Error updating profile:", err);

    // Handle unique constraint violation for email
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already in use" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to generate JWT token (simple implementation)
function generateToken(userId) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64");
  const payload = Buffer.from(
    JSON.stringify({ userId, iat: Math.floor(Date.now() / 1000) })
  ).toString("base64");
  const signature = Buffer.from(`${header}.${payload}.secret`).toString(
    "base64"
  );
  return `${header}.${payload}.${signature}`;
}

// Create auth table if it doesn't exist
async function ensureAuthTable() {
  try {
    const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'auth'
            );
        `);

    if (!tableCheck.rows[0].exists) {
      await pool.query(`
                CREATE TABLE auth (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);
      console.log("Created 'auth' table");
    }
  } catch (err) {
    console.error("Error ensuring auth table:", err);
  }
}

ensureAuthTable();

// POST /api/auth/register - Register new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM auth WHERE email = $1",
      [email]
    );

    if (existingUser.rows[0]) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate user ID
    const userId = `user_${Date.now()}`;

    // In production, use bcrypt. For now, we'll store a simple hash
    const passwordHash = Buffer.from(password).toString("base64");

    // Create auth record
    const authResult = await pool.query(
      `INSERT INTO auth (user_id, email, password_hash, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             RETURNING user_id, email`,
      [userId, email, passwordHash]
    );

    // Ensure users table exists
    const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            );
        `);

    if (!tableCheck.rows[0].exists) {
      await pool.query(`
                CREATE TABLE users (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    role VARCHAR(50) DEFAULT 'citizen',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);
    }

    // Create user profile
    const userResult = await pool.query(
      `INSERT INTO users (id, name, email, phone, role, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING id, name, email, phone, role, created_at, updated_at`,
      [userId, name, email, "", "citizen"]
    );

    const token = generateToken(userId);
    const user = userResult.rows[0];

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already in use" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login - Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    // Find user
    const authResult = await pool.query(
      "SELECT user_id, password_hash FROM auth WHERE email = $1",
      [email]
    );

    if (!authResult.rows[0]) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const authRecord = authResult.rows[0];

    // Verify password (simple comparison - in production use bcrypt)
    const passwordHash = Buffer.from(password).toString("base64");
    if (passwordHash !== authRecord.password_hash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Get user profile
    const userResult = await pool.query(
      "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1",
      [authRecord.user_id]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const token = generateToken(authRecord.user_id);
    const user = userResult.rows[0];

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

// Return local network IPv4 address or localhost
function getLocalIP() {
  const os = require("os");
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
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
