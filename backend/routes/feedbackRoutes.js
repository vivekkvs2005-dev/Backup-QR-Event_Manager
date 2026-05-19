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

router.get("/:token", getFeedbackPage);

router.post("/", submitFeedback);

router.get(
  "/event/:eventId",
  getEventFeedback
);

module.exports = router;