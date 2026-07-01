const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound, internalError } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

const router = express.Router();

// Semua route UMKM memerlukan autentikasi
router.use(authenticate);
router.use(authorize('SELLER', 'ADMIN'));

// ========== REGISTER UMKM ==========
router.post('/register', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    // Validasi
    if (!data.name) return badRequest(res, 'Nama UMKM wajib diisi');
    if (!data.address) return badRequest(res, 'Alamat UMKM wajib diisi');
    if (!data.phone) return badRequest(res, 'Nomor telepon wajib diisi');

    // Cek user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    });

    if (!user) return badRequest(res, 'User tidak ditemukan');
    if (user.role !== 'SELLER') {
      return badRequest(res, 'Hanya seller yang bisa mendaftar UMKM');
    }

    // Cek apakah sudah punya UMKM
    const existingUMKM = await prisma.uMKM.findUnique({
      where: { userId }
    });

    if (existingUMKM) {
      return badRequest(res, 'User sudah terdaftar sebagai UMKM');
    }

    // Buat atau update store
    let store = user.store;
    if (!store) {
      const slug = slugify(data.name, { lower: true, strict: true });
      store = await prisma.store.create({
        data: {
          name: data.name,
          slug,
          address: data.address,
          phone: data.phone,
          sellerId: userId
        }
      });
    }

    // Buat UMKM - Gunakan prisma.uMKM (perhatikan huruf besar M)
    const umkm = await prisma.uMKM.create({
      data: {
        name: data.name,
        description: data.description || '',
        category: data.category || 'MAKANAN',
        subCategory: data.subCategory || '',
        address: data.address,
        phone: data.phone,
        email: data.email || '',
        website: data.website || '',
        socialMedia: data.socialMedia || {},
        businessLicense: data.businessLicense || '',
        idCard: data.idCard || '',
        photo: data.photo || '',
        userId,
        storeId: store.id,
        status: 'PENDING'
      }
    });

    success(res, 'Registrasi UMKM berhasil', umkm);
  } catch (error) {
    console.error('Register UMKM error:', error);
    next(error);
  }
});

// ========== GET UMKM STATUS ==========
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Gunakan prisma.uMKM dengan huruf besar M
    const umkm = await prisma.uMKM.findUnique({
      where: { userId },
      include: {
        store: true,
        products: {
          include: { product: true }
        }
      }
    });

    // Jika belum terdaftar, return null (bukan error)
    if (!umkm) {
      return success(res, 'Belum terdaftar sebagai UMKM', null);
    }

    success(res, 'Status UMKM', umkm);
  } catch (error) {
    console.error('Get UMKM status error:', error);
    // Return null jika error (model belum ada)
    return success(res, 'Belum terdaftar sebagai UMKM', null);
  }
});

module.exports = router;