// ════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");

const {
  registerOrganizer,
  loginOrganizer,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerOrganizer);

router.post("/login", loginOrganizer);

module.exports = router;