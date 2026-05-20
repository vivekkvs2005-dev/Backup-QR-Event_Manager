const {
  getFeedbackPageDataService,
  submitFeedbackService,
  getEventFeedbackService,
} = require("../services/feedbackService");

async function getFeedbackPage(
  req,
  res,
  next
) {
  try {

    const data =
      await getFeedbackPageDataService(
        req.params.token
      );

    if (!data) {
      return res.status(404).json({
        error: "Invalid feedback link.",
      });
    }

    res.json(data);

  } catch (err) {

    next(err);
  }
}

async function submitFeedback(
  req,
  res,
  next
) {

  try {

    const result =
      await submitFeedbackService(
        req.body
      );

    if (
      result.status ===
      "INVALID_TOKEN"
    ) {
      return res.status(404).json({
        error: "Invalid ticket token.",
      });
    }

    if (
      result.status ===
      "ALREADY_SUBMITTED"
    ) {
      return res.status(409).json({
        error:
          "Feedback already submitted.",
      });
    }

    res.json({
      message:
        "Thank you for your feedback!",
    });

  } catch (err) {

    next(err);
  }
}

async function getEventFeedback(
  req,
  res,
  next
) {
  try {

    const feedbackData =
      await getEventFeedbackService(
        req.params.eventId
      );

    res.json(feedbackData);

  } catch (err) {

    next(err);
  }
}

module.exports = {
  getFeedbackPage,
  submitFeedback,
  getEventFeedback,
};