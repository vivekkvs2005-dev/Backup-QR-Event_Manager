const pool = require("../db");

async function checkEventOwnership(
  req,
  res,
  next
) {

  try {

    const { eventId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT organizer_id
      FROM events
      WHERE id = ?
      `,
      [eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    const event = rows[0];

    if (
      event.organizer_id !== req.user.id
    ) {
      return res.status(403).json({
        error: "Access denied.",
      });
    }

    next();

  } catch (err) {

    next(err);
  }
}

module.exports = checkEventOwnership;