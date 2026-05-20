// ════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const {
  registerOrganizer,
  loginOrganizer,
} = require("../controllers/authController");

const router = express.Router();

const validateRequiredFields =
  require("../middleware/validateRequiredFields");

router.post(
  "/register",

  validateRequiredFields([
    "name",
    "email",
    "password",
  ]),

  registerOrganizer
);

router.post(
  "/login",

  validateRequiredFields([
    "email",
    "password",
  ]),

  loginOrganizer
);

module.exports = router;