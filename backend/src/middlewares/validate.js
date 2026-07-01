const { badRequest } = require('../utils/responseHelper');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return badRequest(res, error.details[0].message);
  }
  next();
};

module.exports = validate;