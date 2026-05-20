const pool = require("../db");

async function registerOrganizer(
  req,
  res,
  next
) {
  const { name, email, password } = req.body;

  try {
    const [result] = await pool.query(
      `
      INSERT INTO organizers (
        name,
        email,
        password
      )
      VALUES (?, ?, ?)
      `,
      [name, email, password]
    );

    res.json({
      message: "Registered successfully!",
      id: result.insertId,
      name,
      email,
    });

  } catch (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "Email already registered.",
      });
    }

    next(err);
  }
}

async function loginOrganizer(
  req,
  res,
  next
) {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM organizers
      WHERE email = ?
        AND password = ?
      `,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const { id, name } = rows[0];

    res.json({
      message: "Login successful!",
      id,
      name,
      email,
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error: " + err.message,
    });
  }
}

module.exports = {
  registerOrganizer,
  loginOrganizer,
};