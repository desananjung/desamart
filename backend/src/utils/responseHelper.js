const response = (res, status, message, data = null) => {
  return res.status(status).json({
    status: status < 400 ? 'success' : 'error',
    message,
    data,
  });
};

const success = (res, message, data = null) => response(res, 200, message, data);
const created = (res, message, data = null) => response(res, 201, message, data);
const badRequest = (res, message) => response(res, 400, message);
const unauthorized = (res, message) => response(res, 401, message);
const forbidden = (res, message) => response(res, 403, message);
const notFound = (res, message) => response(res, 404, message);
const conflict = (res, message) => response(res, 409, message);
const internalError = (res, message) => response(res, 500, message);

module.exports = {
  response,
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
};