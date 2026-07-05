const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const commodityService = require('../services/agriculture/commodityService');

const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

// ========== GET FARMS ==========
router.get('/farms', async (req, res, next) => {
  try {
    const farms = await prisma.farm.findMany({
      where: { farmerId: req.user.id },
      include: {
        commodities: true,
        harvests: {
          take: 3,
          orderBy: { harvestDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Daftar lahan', farms);
  } catch (error) {
    console.error('Error fetching farms:', error);
    next(error);
  }
});

// ========== CREATE FARM ==========
router.post('/farms', async (req, res, next) => {
  try {
    const { name, location, area, description, imageUrl } = req.body;

    console.log('📝 Creating farm:', { name, location, area, description, imageUrl });

    // Validasi
    if (!name) return badRequest(res, 'Nama lahan wajib diisi');
    if (!location) return badRequest(res, 'Lokasi lahan wajib diisi');
    if (!area || parseFloat(area) <= 0) {
      return badRequest(res, 'Luas lahan harus lebih dari 0');
    }

    const farm = await prisma.farm.create({
      data: {
        name,
        location,
        area: parseFloat(area),
        description: description || '',
        imageUrl: imageUrl || '',
        farmerId: req.user.id,
        isActive: true
      },
      include: {
        commodities: true
      }
    });

    console.log('✅ Farm created:', farm);
    success(res, 'Lahan berhasil ditambahkan', farm);
  } catch (error) {
    console.error('❌ Error creating farm:', error);
    next(error);
  }
});

// ========== GET FARM BY ID ==========
router.get('/farms/:id', async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        commodities: true,
        harvests: {
          include: {
            commodity: true
          },
          orderBy: { harvestDate: 'desc' }
        }
      }
    });

    if (!farm) {
      return badRequest(res, 'Lahan tidak ditemukan');
    }

    if (farm.farmerId !== req.user.id && req.user.role !== 'ADMIN') {
      return badRequest(res, 'Anda tidak memiliki akses ke lahan ini');
    }

    success(res, 'Detail lahan', farm);
  } catch (error) {
    console.error('Error fetching farm:', error);
    next(error);
  }
});

// ========== MARKET PRICES ==========
router.get('/prices', async (req, res, next) => {
  try {
    const { commodity } = req.query;
    const where = {};
    if (commodity) {
      where.commodity = { contains: commodity, mode: 'insensitive' };
    }

    const prices = await prisma.marketPrice.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 20
    });
    success(res, 'Harga pasaran', prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    next(error);
  }
});

// ========== SEASONS ==========
router.get('/seasons', async (req, res, next) => {
  try {
    const { year } = req.query;
    const where = {};
    if (year) {
      where.year = parseInt(year);
    }

    const seasons = await prisma.seasonInfo.findMany({
      where,
      orderBy: { year: 'desc' }
    });
    success(res, 'Informasi musim', seasons);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    next(error);
  }
});

module.exports = router;