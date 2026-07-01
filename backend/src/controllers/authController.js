// backend/src/controllers/authController.js
const authService = require('../services/authService');
const { created, success, badRequest, conflict } = require('../utils/responseHelper');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.register(name, email, password, role);
    return created(res, 'Registrasi berhasil', user);
  } catch (error) {
    if (error.message === 'Email sudah terdaftar') return conflict(res, error.message);
    if (error.message === 'Role tidak valid') return badRequest(res, error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, 'Login berhasil', result);
  } catch (error) {
    if (error.message === 'Email atau password salah') return badRequest(res, error.message);
    next(error);
  }
};

module.exports = { register, login };