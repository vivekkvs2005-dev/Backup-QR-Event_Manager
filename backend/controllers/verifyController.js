const {
  getTicketDetailsService,
  checkInService,
  markLunchService,
  markKitService,
} = require("../services/verifyService");

async function verifyTicket(
  req,
  res,
  next
) {
  try {

    const attendee =
      await getTicketDetailsService(
        req.params.token
      );

    if (!attendee) {
      return res.status(404).json({
        error:
          "Invalid or unrecognized ticket token.",
      });
    }

res.json(attendee);

  } catch (err) {

    next(err);
  }
}

async function markCheckIn(
  req,
  res,
  next
) {
  try {

    const result =
      await checkInService(
        req.params.token
      );

    if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        error: "Token not found.",
      });
    }

    if (
      result.status ===
      "ALREADY_CHECKED_IN"
    ) {
      return res.status(409).json({
        error: "Already checked in!",
      });
    }

    res.json({
      message:
        "Entry marked successfully!",
    });

  } catch (err) {

    next(err);
  }
}

async function markLunch(
  req,
  res,
  next
) {
  try {

    const result =
      await markLunchService(
        req.params.token
      );

    if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        error: "Token not found.",
      });
    }

    if (
      result.status ===
      "ALREADY_SERVED"
    ) {
      return res.status(409).json({
        error:
          "Lunch already claimed!",
      });
    }

    res.json({
      message:
        "Lunch marked as served!",
    });

  } catch (err) {

    next(err);
  }
}

async function markKit(
  req,
  res,
  next
) {
  try {

    const result =
      await markKitService(
        req.params.token
      );

    if (result.status === "NOT_FOUND") {
      return res.status(404).json({
        error: "Token not found.",
      });
    }

    if (
      result.status ===
      "ALREADY_DISTRIBUTED"
    ) {
      return res.status(409).json({
        error:
          "Kit already distributed!",
      });
    }

    res.json({
      message:
        "Kit marked as distributed!",
    });

  } catch (err) {

    next(err);
  }
}

module.exports = {
  verifyTicket,
  markCheckIn,
  markLunch,
  markKit,
};