// backend/server.js
// QR-Based Event Management System - Backend
// Run: node server.js (after npm install express mysql2 qrcode nodemailer dotenv cors)

require("dotenv").config();

const express = require("express");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const cors = require("cors");

const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

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

// ════════════════════════════════════════════════════════════════
//  ATTENDEE ROUTES
// ════════════════════════════════════════════════════════════════

// POST /api/attendees/register — Public user registers for an event
app.post("/api/attendees/register", async (req, res) => {
  const { event_id, name, email, phone, upi_utr } = req.body;
  if (!event_id || !name || !email || !upi_utr)
    return res.status(400).json({ error: "All fields are required." });

  try {
    await pool.query(
      `INSERT INTO attendees (event_id, name, email, phone, upi_utr, payment_status)
       VALUES (?, ?, ?, ?, ?, 'under_review')`,
      [event_id, name, email, phone, upi_utr]
    );
    res.json({ message: "Registration submitted! Awaiting payment approval." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "This UTR number is already used." });
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// GET /api/attendees/event/:eventId — Get all attendees for an event (organizer dashboard)
app.get("/api/attendees/event/:eventId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendees WHERE event_id = ? ORDER BY id DESC",
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /api/attendees/approve/:attendeeId — Organizer approves payment, sends QR ticket
app.post("/api/attendees/approve/:attendeeId", async (req, res) => {
  const { attendeeId } = req.params;

  try {
    // Fetch attendee + event details together
    const [rows] = await pool.query(
      `
      SELECT 
        attendees.*,
        events.title AS event_title,
        events.venue,
        events.event_date
      FROM attendees
      JOIN events 
        ON attendees.event_id = events.id
      WHERE attendees.id = ?
      `,
      [attendeeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Attendee not found.",
      });
    }

    const attendee = rows[0];

    // Generate ticket token
    const ticketToken =
      "TKT-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    // Verification URL
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${ticketToken}`;

    // Save token + payment status
    await pool.query(
      `
      UPDATE attendees
      SET payment_status = 'paid',
          ticket_token = ?
      WHERE id = ?
      `,
      [ticketToken, attendeeId]
    );

    // Generate QR Code
    const qrBuffer = await QRCode.toBuffer(verifyUrl);

    // Format event date nicely
    const formattedDate = new Date(
      attendee.event_date
    ).toLocaleString();

    // Send Email
    await transporter.sendMail({
      from: `"Event Manager" <${process.env.EMAIL_USER}>`,
      to: attendee.email,

      subject: `🎟️ Ticket Confirmed - ${attendee.event_title}`,

      attachments: [
        {
          filename: "ticket-qr.png",
          content: qrBuffer,
          cid: "ticketqr", // important
        },
      ],

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
        ">
          
          <h1 style="color:#2563eb; text-align:center;">
            🎟️ Event Ticket Confirmed
          </h1>

          <p>Hello <strong>${attendee.name}</strong>,</p>

          <p>
            Your payment has been approved successfully.
          </p>

          <div style="
            background:#f3f4f6;
            padding:16px;
            border-radius:10px;
            margin:20px 0;
          ">
            <h2 style="margin-top:0;">
              ${attendee.event_title}
            </h2>

            <p>
              <strong>📍 Venue:</strong>
              ${attendee.venue}
            </p>

            <p>
              <strong>📅 Date & Time:</strong>
              ${formattedDate}
            </p>

            <p>
              <strong>🎫 Ticket Token:</strong>
              ${ticketToken}
            </p>
          </div>

          <div style="text-align:center; margin:25px 0;">
            <p>
              Scan this QR code at the venue entrance
            </p>

            <img 
              src="cid:ticketqr"
              alt="QR Code"
              style="
                width:220px;
                height:220px;
                border:4px solid #2563eb;
                border-radius:12px;
                padding:10px;
                background:white;
              "
            />
          </div>

          <p style="margin-top:25px;">
            We look forward to seeing you at the event 🎉
          </p>

        </div>
      `,
    });

    res.json({
      message: `Ticket approved and email sent to ${attendee.email}`,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
});

// POST /api/attendees/reject/:attendeeId — Organizer rejects payment
app.post("/api/attendees/reject/:attendeeId", async (req, res) => {
  try {
    await pool.query(
      "UPDATE attendees SET payment_status = 'failed' WHERE id = ?",
      [req.params.attendeeId]
    );
    res.json({ message: "Payment marked as failed." });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ════════════════════════════════════════════════════════════════
//  GATEKEEPER / VERIFY ROUTES
// ════════════════════════════════════════════════════════════════

// GET /api/verify/:token — Get attendee info by ticket token (for gatekeeper scan)
app.get("/api/verify/:token", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT attendees.*, events.title AS event_title, events.venue, events.event_date
       FROM attendees
       JOIN events ON attendees.event_id = events.id
       WHERE attendees.ticket_token = ?`,
      [req.params.token]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Invalid or unrecognized ticket token." });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// PATCH /api/verify/checkin/:token — Mark entry (checked_in = true)
app.patch("/api/verify/checkin/:token", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT checked_in FROM attendees WHERE ticket_token = ?",
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Token not found." });
    if (rows[0].checked_in) return res.status(409).json({ error: "Already checked in!" });

    await pool.query(
      "UPDATE attendees SET checked_in = TRUE WHERE ticket_token = ?",
      [req.params.token]
    );
    res.json({ message: "Entry marked successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// PATCH /api/verify/lunch/:token — Mark lunch served
app.patch("/api/verify/lunch/:token", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT lunch_served FROM attendees WHERE ticket_token = ?",
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Token not found." });
    if (rows[0].lunch_served) return res.status(409).json({ error: "Lunch already claimed!" });

    await pool.query(
      "UPDATE attendees SET lunch_served = TRUE WHERE ticket_token = ?",
      [req.params.token]
    );
    res.json({ message: "Lunch marked as served!" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// PATCH /api/verify/kit/:token — Mark kit distributed
app.patch("/api/verify/kit/:token", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT kit_distributed FROM attendees WHERE ticket_token = ?",
      [req.params.token]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Token not found." });
    if (rows[0].kit_distributed) return res.status(409).json({ error: "Kit already distributed!" });

    await pool.query(
      "UPDATE attendees SET kit_distributed = TRUE WHERE ticket_token = ?",
      [req.params.token]
    );
    res.json({ message: "Kit marked as distributed!" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /api/feedback
// GET /api/feedback/:token — Get attendee + event info for feedback page
app.get("/api/feedback/:token", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        attendees.id AS attendee_id,
        attendees.name,
        attendees.email,
        attendees.ticket_token,
        events.id AS event_id,
        events.title AS event_title,
        events.venue,
        events.event_date
      FROM attendees
      JOIN events
        ON attendees.event_id = events.id
      WHERE attendees.ticket_token = ?
        AND attendees.payment_status = 'paid'
      `,
      [req.params.token]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Invalid feedback link.",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
});


// ════════════════════════════════════════════════════════════════
//  FEEDBACK ROUTES
// ════════════════════════════════════════════════════════════════

// POST /api/feedback — Submit attendee feedback
app.post("/api/feedback", async (req, res) => {
  const { ticket_token, rating, comments } = req.body;

  if (!ticket_token || !rating) {
    return res.status(400).json({
      error: "Ticket token and rating are required.",
    });
  }

  try {
    // Verify attendee exists
    const [attendeeRows] = await pool.query(
      `
      SELECT *
      FROM attendees
      WHERE ticket_token = ?
      `,
      [ticket_token]
    );

    if (attendeeRows.length === 0) {
      return res.status(404).json({
        error: "Invalid ticket token.",
      });
    }

    const attendee = attendeeRows[0];

    // Check if feedback already submitted
    const [existingFeedback] = await pool.query(
      `
      SELECT id
      FROM feedback
      WHERE ticket_token = ?
      `,
      [ticket_token]
    );

    if (existingFeedback.length > 0) {
      return res.status(409).json({
        error: "Feedback already submitted.",
      });
    }

    // Insert feedback
    await pool.query(
      `
      INSERT INTO feedback (
        event_id,
        ticket_token,
        rating,
        comments
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        attendee.event_id,
        ticket_token,
        rating,
        comments,
      ]
    );

    res.json({
      message: "Thank you for your feedback!",
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
});

// GET /api/feedback/event/:eventId — Get all feedback for an event
app.get("/api/feedback/event/:eventId", async (req, res) => {
  try {
    // Get all feedback entries
    const [feedbackRows] = await pool.query(
      `
      SELECT rating, comments
      FROM feedback
      WHERE event_id = ?
      ORDER BY id DESC
      `,
      [req.params.eventId]
    );

    // Get average rating + total count
    const [statsRows] = await pool.query(
      `
      SELECT 
        AVG(rating) AS average_rating,
        COUNT(*) AS total_feedback
      FROM feedback
      WHERE event_id = ?
      `,
      [req.params.eventId]
    );

    res.json({
      feedback: feedbackRows,
      stats: {
        average_rating: statsRows[0].average_rating || 0,
        total_feedback: statsRows[0].total_feedback || 0,
      },
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