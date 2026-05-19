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

router.post("/register", registerAttendee);

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