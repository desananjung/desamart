// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// GET ALL CATEGORIES
// ============================================
router.get('/', async (req, res) => {
  try {
    console.log('📂 GET /categories called');
    
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`✅ Found ${categories.length} categories`);
    
    // ✅ Format response yang benar
    res.json({
      success: true,
      message: 'Daftar kategori berhasil diambil',
      data: categories
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil kategori',
      error: error.message
    });
  }
});

// ============================================
// CREATE CATEGORY (Admin only)
// ============================================
router.post('/', async (req, res) => {
  try {
    const { name, slug } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi'
      });
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/ /g, '-')
      }
    });
    
    res.json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kategori',
      error: error.message
    });
  }
});

module.exports = router;