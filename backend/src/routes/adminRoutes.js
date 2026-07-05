const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success } = require('../utils/responseHelper');
const categoryController = require('../controllers/categoryController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Semua route di sini hanya bisa diakses oleh ADMIN
router.use(authenticate, authorize('ADMIN'));

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', (req, res) => {
  success(res, 'Admin dashboard', { user: req.user });
});

// ============================================
// USERS - Dengan search
// ============================================
router.get('/users', async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      take: search ? 10 : 100,
      orderBy: { createdAt: 'desc' }
    });
    
    success(res, 'Daftar user', users);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
});

// ============================================
// CATEGORIES
// ============================================
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);

module.exports = router;