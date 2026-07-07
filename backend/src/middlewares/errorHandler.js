// backend/middlewares/errorHandler.js
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = `Data dengan ${err.meta?.target?.join(', ') || 'field'} sudah ada`;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Data tidak ditemukan';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Referensi data tidak valid';
        break;
      default:
        statusCode = 400;
        message = `Database error: ${err.message}`;
    }
  }

  // Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validasi gagal';
    errors = err.errors;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token tidak valid';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token telah kadaluarsa';
  }

  // CORS Errors
  if (err.message && err.message.includes('CORS')) {
    statusCode = 403;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;