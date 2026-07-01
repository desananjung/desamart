const jwt = require('jsonwebtoken');
const { unauthorized, forbidden } = require('../utils/responseHelper');

// Middleware autentikasi
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return unauthorized(res, 'Token tidak valid atau kadaluarsa');
  }
};

// Middleware otorisasi
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorized(res, 'Harap login terlebih dahulu');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return forbidden(res, `Akses ditolak, role Anda (${req.user.role}) tidak diizinkan. Diperlukan: ${allowedRoles.join(', ')}`);
    }
    next();
  };
};

module.exports = { authenticate, authorize };