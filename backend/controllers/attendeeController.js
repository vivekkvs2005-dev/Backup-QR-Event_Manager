const pool = require("../db");

const QRCode = require("qrcode");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function registerAttendee(req, res) {
  const {
    event_id,
    name,
    email,
    phone,
    upi_utr,
  } = req.body;

  if (!event_id || !name || !email || !upi_utr) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {

    await pool.query(
      `
      INSERT INTO attendees (
        event_id,
        name,
        email,
        phone,
        upi_utr,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, 'under_review')
      `,
      [
        event_id,
        name,
        email,
        phone,
        upi_utr,
      ]
    );

    res.json({
      message:
        "Registration submitted! Awaiting payment approval.",
    });

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "This UTR number is already used.",
      });
    }

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

async function getEventAttendees(req, res) {
  try {

    const [rows] = await pool.query(
      `
      SELECT *
      FROM attendees
      WHERE event_id = ?
      ORDER BY id DESC
      `,
      [req.params.eventId]
    );

    res.json(rows);

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

async function approveAttendee(req, res) {
  const { attendeeId } = req.params;

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

    const ticketToken =
      "TKT-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    const verifyUrl =
      `${process.env.FRONTEND_URL}/verify/${ticketToken}`;

    await pool.query(
      `
      UPDATE attendees
      SET payment_status = 'paid',
          ticket_token = ?
      WHERE id = ?
      `,
      [ticketToken, attendeeId]
    );

    const qrBuffer =
      await QRCode.toBuffer(verifyUrl);

    const formattedDate =
      new Date(
        attendee.event_date
      ).toLocaleString();

    await transporter.sendMail({
      from:
        `"Event Manager" <${process.env.EMAIL_USER}>`,

      to: attendee.email,

      subject:
        `🎟️ Ticket Confirmed - ${attendee.event_title}`,

      attachments: [
        {
          filename: "ticket-qr.png",
          content: qrBuffer,
          cid: "ticketqr",
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
      message:
        `Ticket approved and email sent to ${attendee.email}`,
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

async function rejectAttendee(req, res) {
  try {

    await pool.query(
      `
      UPDATE attendees
      SET payment_status = 'failed'
      WHERE id = ?
      `,
      [req.params.attendeeId]
    );

    res.json({
      message: "Payment marked as failed.",
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

module.exports = {
  registerAttendee,
  getEventAttendees,
  approveAttendee,
  rejectAttendee,
};