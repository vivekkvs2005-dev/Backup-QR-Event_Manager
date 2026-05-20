// ════════════════════════════════════════════════════════════════
//  FEEDBACK ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const {
  getFeedbackPage,
  submitFeedback,
  getEventFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

const validateRequiredFields =
  require("../middleware/validateRequiredFields");

router.get("/:token", getFeedbackPage);

router.post(
  "/",

  validateRequiredFields([
    "ticket_token",
    "rating",
  ]),

  submitFeedback
);

router.get(
  "/event/:eventId",
  getEventFeedback
);

module.exports = router;