const generateTicketToken =  require("../utils/tokenGenerator");

const generateQRCode =  require("../utils/qrGenerator");

const {
  registerAttendeeService,
  getEventAttendeesService,
  approveAttendeeService,
  rejectAttendeeService,
} = require("../services/attendeeService");

const {
  formatEventDate,
} = require("../utils/formatters");

async function registerAttendee(
  req,
  res,
  next
) {

  try {

    await registerAttendeeService(
      req.body
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

    next(err);
  }
}

async function getEventAttendees(
  req,
  res,
  next
) {
  try {

    const attendees =
      await getEventAttendeesService(
        req.params.eventId
      );

    res.json(attendees);

  } catch (err) {
      next(err);
    }
}

async function approveAttendee(
  req,
  res,
  next
) {
  const { attendeeId } = req.params;

  try {

    const email =
      await approveAttendeeService(
        req.params.attendeeId
      );

    if (!email) {
      return res.status(404).json({
        error: "Attendee not found.",
      });
    }

    res.json({
      message:
        `Ticket approved and email sent to ${email}`,
    });

  } catch (err) {

      console.log(err);

      next(err);
  }
}

async function rejectAttendee(
  req,
  res,
  next
) {
  try {

    await rejectAttendeeService(
      req.params.attendeeId
    );

    res.json({
      message: "Payment marked as failed.",
    });

  } catch (err) {
      next(err);
    }
}

module.exports = {
  registerAttendee,
  getEventAttendees,
  approveAttendee,
  rejectAttendee,
};