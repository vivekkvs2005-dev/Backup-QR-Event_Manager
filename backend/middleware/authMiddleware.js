const pool = require("../db");

const jwt = require("jsonwebtoken");

async function protect(
  req,
  res,
  next
) {

  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Not authorized.",
    });
  }

  try {

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const [rows] = await pool.query(
      `
      SELECT id
      FROM organizers
      WHERE id = ?
      `,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Organizer no longer exists.",
      });
    }

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      error: "Invalid token.",
    });
  }
}

module.exports = {
  protect,
};