const pool = require("../db");

async function getTicketDetailsService(
  token
) {

  const [rows] = await pool.query(
    `
    SELECT
      attendees.*,
      events.title AS event_title,
      events.venue,
      events.event_date
    FROM attendees
    JOIN events
      ON attendees.event_id = events.id
    WHERE attendees.ticket_token = ?
    `,
    [token]
  );

  return rows[0] || null;
}

async function checkInService(
  token
) {

  const [rows] = await pool.query(
    `
    SELECT checked_in
    FROM attendees
    WHERE ticket_token = ?
    `,
    [token]
  );

  if (rows.length === 0) {
    return {
      status: "NOT_FOUND",
    };
  }

  if (rows[0].checked_in) {
    return {
      status: "ALREADY_CHECKED_IN",
    };
  }

  await pool.query(
    `
    UPDATE attendees
    SET checked_in = TRUE
    WHERE ticket_token = ?
    `,
    [token]
  );

  return {
    status: "SUCCESS",
  };
}

async function markLunchService(
  token
) {

  const [rows] = await pool.query(
    `
    SELECT lunch_served
    FROM attendees
    WHERE ticket_token = ?
    `,
    [token]
  );

  if (rows.length === 0) {
    return {
      status: "NOT_FOUND",
    };
  }

  if (rows[0].lunch_served) {
    return {
      status: "ALREADY_SERVED",
    };
  }

  await pool.query(
    `
    UPDATE attendees
    SET lunch_served = TRUE
    WHERE ticket_token = ?
    `,
    [token]
  );

  return {
    status: "SUCCESS",
  };
}

async function markKitService(
  token
) {

  const [rows] = await pool.query(
    `
    SELECT kit_distributed
    FROM attendees
    WHERE ticket_token = ?
    `,
    [token]
  );

  if (rows.length === 0) {
    return {
      status: "NOT_FOUND",
    };
  }

  if (rows[0].kit_distributed) {
    return {
      status: "ALREADY_DISTRIBUTED",
    };
  }

  await pool.query(
    `
    UPDATE attendees
    SET kit_distributed = TRUE
    WHERE ticket_token = ?
    `,
    [token]
  );

  return {
    status: "SUCCESS",
  };
}

module.exports = {
  getTicketDetailsService,
  checkInService,
  markLunchService,
  markKitService,
};