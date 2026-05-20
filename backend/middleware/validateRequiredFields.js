function validateRequiredFields(fields) {

  return function (req, res, next) {

    const missingFields = [];

    for (const field of fields) {

      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {

      return res.status(400).json({
        error:
          `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = validateRequiredFields;