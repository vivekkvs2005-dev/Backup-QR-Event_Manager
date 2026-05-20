// backend/server.js
// QR-Based Event Management System - Backend
// Run: node server.js (after npm install express mysql2 qrcode nodemailer dotenv cors)

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const errorHandler =
  require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/feedback", feedbackRoutes);

// ─── DATABASE SETUP (Run once to create tables) ──────────────────────────────
async function initializeDatabase() {
  const conn = await pool.getConnection();
  try {
    // Create organizers table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS organizers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create events table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organizer_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        event_date DATETIME NOT NULL,
        venue VARCHAR(200),
        price DECIMAL(10,2) DEFAULT 0,
        organizer_upi_id VARCHAR(100),
        organizer_email VARCHAR(150),
        is_completed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (organizer_id) REFERENCES organizers(id)
        )
    `);

    // Create attendees table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS attendees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20),
        upi_utr VARCHAR(50) UNIQUE NOT NULL,
        payment_status ENUM('under_review', 'paid', 'failed') DEFAULT 'under_review',
        ticket_token VARCHAR(100) UNIQUE,
        checked_in BOOLEAN DEFAULT FALSE,
        lunch_served BOOLEAN DEFAULT FALSE,
        kit_distributed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (event_id) REFERENCES events(id)
      )
    `);

    // Create feedback table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        ticket_token VARCHAR(100) UNIQUE,
        comments TEXT,
        FOREIGN KEY (event_id) REFERENCES events(id)
      )
    `);

    console.log("✅ All tables created / verified successfully.");
  } finally {
    conn.release();
  }
}

app.use(errorHandler);
// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err.message);
    process.exit(1);
  });