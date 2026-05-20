const {
  registerOrganizerService,
  loginOrganizerService,
} = require("../services/authService");

async function registerOrganizer(
  req,
  res,
  next
) {
  const { name, email, password } = req.body;

  try {
    const organizer =
    await registerOrganizerService(
      name,
      email,
      password
    );

    res.json({
      message: "Registered successfully!",
      ...organizer,
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
    const organizer =
      await loginOrganizerService(
        email,
        password
      );

    if (!organizer) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const { id, name } = organizer;

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