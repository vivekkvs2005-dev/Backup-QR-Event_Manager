const pool = require("../db");

const transporter = require("../utils/mailer");

async function createEvent(
  req,
  res,
  next
) {
  const {
    organizer_id,
    title,
    description,
    event_date,
    venue,
    price,
    organizer_upi_id,
    organizer_email,
  } = req.body;

  const mysqlDate =
    event_date
      ? event_date.replace("T", " ")
      : null;

  try {

    const [result] = await pool.query(
      `
      INSERT INTO events (
        organizer_id,
        title,
        description,
        event_date,
        venue,
        price,
        organizer_upi_id,
        organizer_email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        organizer_id,
        title,
        description,
        mysqlDate,
        venue,
        price,
        organizer_upi_id,
        organizer_email,
      ]
    );

    res.json({
      message: "Event created!",
      id: result.insertId,
    });

  } catch (err) {
      next(err);
    }
}

async function getEvent(
  req,
  res,
  next
) {
  try {

    const [rows] = await pool.query(
      `
      SELECT *
      FROM events
      WHERE id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Event not found.",
      });
    }

    res.json(rows[0]);

  } catch (err) {
      next(err);
    }
}

async function getOrganizerEvents(
  req,
  res,
  next
) {
  try {

    const [rows] = await pool.query(
      `
      SELECT *
      FROM events
      WHERE organizer_id = ?
      ORDER BY event_date DESC
      `,
      [req.params.organizerId]
    );

    res.json(rows);

  } catch (err) {
      next(err);
    }
}

async function completeEvent(
  req,
  res,
  next
) {
  try {

    const { eventId } = req.params;

    await pool.query(
      `
      UPDATE events
      SET is_completed = TRUE
      WHERE id = ?
      `,
      [eventId]
    );

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
      next(err);
    }
}

module.exports = {
  createEvent,
  getEvent,
  getOrganizerEvents,
  completeEvent,
};