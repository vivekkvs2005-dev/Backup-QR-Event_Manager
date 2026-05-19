require("dotenv").config();

const mysql = require("mysql2/promise");

// ─── DATABASE CONNECTION POOL ────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: "event_manager_db",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;