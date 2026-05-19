const pool = require("../db");

async function verifyTicket(req, res) {
  try {

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
      WHERE attendees.ticket_token = ?
      `,
      [req.params.token]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error:
          "Invalid or unrecognized ticket token.",
      });
    }

    res.json(rows[0]);

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

async function markCheckIn(req, res) {
  try {

    const [rows] = await pool.query(
      `
      SELECT checked_in
      FROM attendees
      WHERE ticket_token = ?
      `,
      [req.params.token]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Token not found.",
      });
    }

    if (rows[0].checked_in) {
      return res.status(409).json({
        error: "Already checked in!",
      });
    }

    await pool.query(
      `
      UPDATE attendees
      SET checked_in = TRUE
      WHERE ticket_token = ?
      `,
      [req.params.token]
    );

    res.json({
      message: "Entry marked successfully!",
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

async function markLunch(req, res) {
  try {

    const [rows] = await pool.query(
      `
      SELECT lunch_served
      FROM attendees
      WHERE ticket_token = ?
      `,
      [req.params.token]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Token not found.",
      });
    }

    if (rows[0].lunch_served) {
      return res.status(409).json({
        error: "Lunch already claimed!",
      });
    }

    await pool.query(
      `
      UPDATE attendees
      SET lunch_served = TRUE
      WHERE ticket_token = ?
      `,
      [req.params.token]
    );

    res.json({
      message: "Lunch marked as served!",
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

async function markKit(req, res) {
  try {

    const [rows] = await pool.query(
      `
      SELECT kit_distributed
      FROM attendees
      WHERE ticket_token = ?
      `,
      [req.params.token]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Token not found.",
      });
    }

    if (rows[0].kit_distributed) {
      return res.status(409).json({
        error: "Kit already distributed!",
      });
    }

    await pool.query(
      `
      UPDATE attendees
      SET kit_distributed = TRUE
      WHERE ticket_token = ?
      `,
      [req.params.token]
    );

    res.json({
      message: "Kit marked as distributed!",
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

module.exports = {
  verifyTicket,
  markCheckIn,
  markLunch,
  markKit,
};