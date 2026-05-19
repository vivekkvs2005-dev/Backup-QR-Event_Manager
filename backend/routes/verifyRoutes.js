// ════════════════════════════════════════════════════════════════
//  VERIFY ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const {
  verifyTicket,
  markCheckIn,
  markLunch,
  markKit,
} = require("../controllers/verifyController");

const router = express.Router();

router.get("/:token", verifyTicket);

router.patch(
  "/checkin/:token",
  markCheckIn
);

router.patch(
  "/lunch/:token",
  markLunch
);

router.patch(
  "/kit/:token",
  markKit
);

module.exports = router;