const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success } = require('../utils/responseHelper'); // TAMBAHKAN INI
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Semua route di sini hanya bisa diakses oleh ADMIN
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', (req, res) => {
  success(res, 'Admin dashboard', { user: req.user });
});

// Contoh: mengelola semua user
router.get('/users', async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    success(res, 'Daftar semua user', users);
  } catch (error) {
    next(error);
  }
});

// Routes kategori (admin only)
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);

module.exports = router;