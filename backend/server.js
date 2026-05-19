// backend/server.js
// QR-Based Event Management System - Backend
// Run: node server.js (after npm install express mysql2 qrcode nodemailer dotenv cors)

require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const attendeeRoutes = require("./routes/attendeeRoutes");
const verifyRoutes = require("./routes/verifyRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/feedback", feedbackRoutes);

// ─── NODEMAILER TRANSPORTER ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use Gmail App Password
  },
});

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

// GET /api/events/:id — Get single event details (public, for registration page)
app.get("/api/events/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Event not found." });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// GET /api/events/organizer/:organizerId — Get all events for an organizer (dashboard)
app.get("/api/events/organizer/:organizerId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM events WHERE organizer_id = ? ORDER BY event_date DESC",
      [req.params.organizerId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// PATCH /api/events/complete/:eventId — Mark event completed
app.patch("/api/events/complete/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Mark event completed
    await pool.query(
    `
    UPDATE events
    SET is_completed = TRUE
    WHERE id = ?
    `,
    [eventId]
    );

    // Fetch all paid attendees + event details
    const [attendees] = await pool.query(
    `
    SELECT
        attendees.name,
        attendees.email,
        attendees.ticket_token,
        events.title AS event_title
    FROM attendees
    JOIN events
        ON attendees.event_id = events.id
    WHERE attendees.event_id = ?
        AND attendees.payment_status = 'paid'
    `,
    [eventId]
    );

    // Send feedback emails
    for (const attendee of attendees) {

    const feedbackUrl =
        `${process.env.FRONTEND_URL}/feedback/${attendee.ticket_token}`;

    await transporter.sendMail({
        from: `"Event Manager" <${process.env.EMAIL_USER}>`,
        to: attendee.email,

        subject: `💬 Share Feedback — ${attendee.event_title}`,

        html: `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
        ">

            <h1 style="
            color:#2563eb;
            text-align:center;
            ">
            🎉 Thank You for Attending
            </h1>

            <p>
            Hello <strong>${attendee.name}</strong>,
            </p>

            <p>
            Thank you for attending
            <strong>${attendee.event_title}</strong>.
            </p>

            <p>
            We would love to hear your feedback.
            </p>

            <div style="
            text-align:center;
            margin:30px 0;
            ">

            <a
                href="${feedbackUrl}"
                style="
                background:#2563eb;
                color:white;
                padding:14px 22px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                display:inline-block;
                "
            >
                Submit Feedback
            </a>

            </div>

            <p>
            Your feedback helps us improve future events.
            </p>

            <p>
            Thank you again 🎊
            </p>

        </div>
        `,
    });
    }

    res.json({
    message:
        `Event completed and feedback emails sent to ${attendees.length} attendees!`,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
});

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