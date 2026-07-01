const { internalError } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  return internalError(res, err.message || 'Terjadi kesalahan server');
};

module.exports = errorHandler;