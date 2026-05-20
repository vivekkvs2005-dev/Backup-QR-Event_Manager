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

const validateRequiredFields =
  require("../middleware/validateRequiredFields");

const {
    protect,
  } = require("../middleware/authMiddleware");

router.post(
  "/",

  protect,

  validateRequiredFields([
    "organizer_id",
    "title",
    "event_date",
  ]),

  createEvent
);

router.get("/:id", getEvent);

router.get(
  "/organizer/:organizerId",

  protect,  

  getOrganizerEvents
);

router.patch(
  "/complete/:eventId",

  protect,

  completeEvent
);

module.exports = router;