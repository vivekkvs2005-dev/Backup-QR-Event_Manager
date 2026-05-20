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

const checkEventOwnership =
  require("../middleware/checkEventOwnership");

router.post(
  "/",

  protect,

  validateRequiredFields([
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

  checkEventOwnership,

  completeEvent
);

module.exports = router;