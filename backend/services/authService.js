const pool = require("../db");
const bcrypt = require("bcryptjs");

async function registerOrganizerService(
  name,
  email,
  password
) {

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `
    INSERT INTO organizers (
      name,
      email,
      password
    )
    VALUES (?, ?, ?)
    `,
    [name, email, hashedPassword]
  );

  return {
    id: result.insertId,
    name,
    email,
  };
}

async function loginOrganizerService(
  email,
  password
) {

  const [rows] = await pool.query(
    `
    SELECT *
    FROM organizers
    WHERE email = ?
    `,
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  const organizer =
    rows[0];

  const isPasswordValid =
    await bcrypt.compare(
      password,
      organizer.password
    );

  if (!isPasswordValid) {
    return null;
  }

  return organizer;
}

module.exports = {
  registerOrganizerService,
  loginOrganizerService,
};