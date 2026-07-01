const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { success } = require('../utils/responseHelper');

const router = express.Router();

// GET /api/categories - Public endpoint untuk semua user
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    success(res, 'Daftar kategori', categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;