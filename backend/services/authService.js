const pool = require("../db");

async function registerOrganizerService(
  name,
  email,
  password
) {

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
      AND password = ?
    `,
    [email, password]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

module.exports = {
  registerOrganizerService,
  loginOrganizerService,
};