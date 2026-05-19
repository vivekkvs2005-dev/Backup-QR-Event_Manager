// ════════════════════════════════════════════════════════════════
//  FEEDBACK ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const pool = require("../db");

const router = express.Router();

// POST /api/feedback
// GET /api/feedback/:token — Get attendee + event info for feedback page
router.get("/:token", async (req, res) => {
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

// POST /api/feedback — Submit attendee feedback
router.post("/", async (req, res) => {
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
router.get("/event/:eventId", async (req, res) => {
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

module.exports = router;