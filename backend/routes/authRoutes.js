// ════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════════

const express = require("express");
const pool = require("../db");

const router = express.Router();

// POST /api/auth/register — Organizer Sign Up
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required." });

  try {
    const [result] = await pool.query(
      "INSERT INTO organizers (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    res.json({ message: "Registered successfully!", id: result.insertId, name, email });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Email already registered." });
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// POST /api/auth/login — Organizer Sign In
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM organizers WHERE email = ? AND password = ?",
      [email, password]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid email or password." });

    const { id, name } = rows[0];
    res.json({ message: "Login successful!", id, name, email });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;