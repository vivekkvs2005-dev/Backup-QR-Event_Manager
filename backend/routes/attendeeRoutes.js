// ════════════════════════════════════════════════════════════════
//  ATTENDEE ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const {
  registerAttendee,
  getEventAttendees,
  approveAttendee,
  rejectAttendee,
} = require("../controllers/attendeeController");

const router = express.Router();

const validateRequiredFields =
  require("../middleware/validateRequiredFields");

router.post(
  "/register",

  validateRequiredFields([
    "event_id",
    "name",
    "email",
    "upi_utr",
  ]),

  registerAttendee
);

router.get(
  "/event/:eventId",
  getEventAttendees
);

router.post(
  "/approve/:attendeeId",
  approveAttendee
);

router.post(
  "/reject/:attendeeId",
  rejectAttendee
);

module.exports = router;