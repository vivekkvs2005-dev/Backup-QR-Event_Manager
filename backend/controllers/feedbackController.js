const pool = require("../db");

async function getFeedbackPage(req, res) {
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
}

async function submitFeedback(req, res) {
  const {
    ticket_token,
    rating,
    comments,
  } = req.body;

  if (!ticket_token || !rating) {
    return res.status(400).json({
      error:
        "Ticket token and rating are required.",
    });
  }

  try {

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
}

async function getEventFeedback(req, res) {
  try {

    const [feedbackRows] = await pool.query(
      `
      SELECT rating, comments
      FROM feedback
      WHERE event_id = ?
      ORDER BY id DESC
      `,
      [req.params.eventId]
    );

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
        average_rating:
          statsRows[0].average_rating || 0,

        total_feedback:
          statsRows[0].total_feedback || 0,
      },
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

module.exports = {
  getFeedbackPage,
  submitFeedback,
  getEventFeedback,
};