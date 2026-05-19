// ════════════════════════════════════════════════════════════════
//  EVENT ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const pool = require("../db");

const router = express.Router();

// POST /api/events — Create a new event
router.post("/", async (req, res) => {
  const { organizer_id, title, description, event_date, venue, price, organizer_upi_id, organizer_email } = req.body;

  // FIX: Replace "T" from HTML datetime-local input so MySQL accepts it
  const mysqlDate = event_date ? event_date.replace("T", " ") : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO events (organizer_id, title, description, event_date, venue, price, organizer_upi_id, organizer_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [organizer_id, title, description, mysqlDate, venue, price, organizer_upi_id, organizer_email]
    );
    res.json({ message: "Event created!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;