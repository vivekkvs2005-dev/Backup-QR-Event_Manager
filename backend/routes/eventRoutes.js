// ════════════════════════════════════════════════════════════════
//  EVENT ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const {
  createEvent,
  getEvent,
  getOrganizerEvents,
  completeEvent,
} = require("../controllers/eventController");

const router = express.Router();

router.post("/", createEvent);

router.get("/:id", getEvent);

router.get(
  "/organizer/:organizerId",
  getOrganizerEvents
);

router.patch(
  "/complete/:eventId",
  completeEvent
);

module.exports = router;