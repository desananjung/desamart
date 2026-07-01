const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

// ========== DASHBOARD ==========
router.get('/dashboard', async (req, res, next) => {
  try {
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        stores: { include: { store: true } },
        products: { include: { product: true } },
        orders: { include: { order: true } },
        members: { include: { user: true } }
      }
    });

    if (!enterprise) {
      return success(res, 'Belum memiliki enterprise', null);
    }

    // Hitung statistik
    const totalRevenue = enterprise.orders.reduce((sum, o) => sum + (o.order?.total || 0), 0);
    const totalOrders = enterprise.orders.length;
    const totalProducts = enterprise.products.length;
    const totalStores = enterprise.stores.length;
    const totalMembers = enterprise.members.length;

    const dashboard = {
      enterprise,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalStores,
        totalMembers
      }
    };

    success(res, 'Dashboard enterprise', dashboard);
  } catch (error) { next(error); }
});

// ========== ENTERPRISE ==========
router.post('/create', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, description, type, address, phone, email, website } = req.body;
    if (!name || !address || !phone) {
      return badRequest(res, 'Nama, alamat, dan telepon wajib diisi');
    }

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await prisma.enterprise.findUnique({ where: { slug } });
    if (existing) return badRequest(res, 'Nama enterprise sudah digunakan');

    const enterprise = await prisma.enterprise.create({
      data: {
        name,
        slug,
        description,
        type: type || 'UMKM',
        address,
        phone,
        email,
        website,
        ownerId: req.user.id
      }
    });

    success(res, 'Enterprise berhasil dibuat', enterprise);
  } catch (error) { next(error); }
});

// ========== STORE ==========
router.post('/stores/add', async (req, res, next) => {
  try {
    const { enterpriseId, storeId } = req.body;
    if (!enterpriseId || !storeId) {
      return badRequest(res, 'Enterprise ID dan Store ID wajib diisi');
    }

    // Cek apakah user memiliki akses ke enterprise
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        id: parseInt(enterpriseId),
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id, role: { in: ['OWNER', 'ADMIN'] } } } }
        ]
      }
    });

    if (!enterprise) return notFound(res, 'Enterprise tidak ditemukan atau akses ditolak');

    const enterpriseStore = await prisma.enterpriseStore.create({
      data: {
        enterpriseId: parseInt(enterpriseId),
        storeId: parseInt(storeId),
        name: `Toko #${storeId}`
      }
    });

    success(res, 'Toko berhasil ditambahkan ke enterprise', enterpriseStore);
  } catch (error) { next(error); }
});

// ========== MEMBERS ==========
router.post('/members/add', async (req, res, next) => {
  try {
    const { enterpriseId, userId, role, permissions } = req.body;
    if (!enterpriseId || !userId) {
      return badRequest(res, 'Enterprise ID dan User ID wajib diisi');
    }

    const enterprise = await prisma.enterprise.findFirst({
      where: {
        id: parseInt(enterpriseId),
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id, role: { in: ['OWNER', 'ADMIN'] } } } }
        ]
      }
    });

    if (!enterprise) return notFound(res, 'Enterprise tidak ditemukan atau akses ditolak');

    const member = await prisma.enterpriseMember.create({
      data: {
        enterpriseId: parseInt(enterpriseId),
        userId: parseInt(userId),
        role: role || 'STAFF',
        permissions: permissions || {}
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    success(res, 'Anggota berhasil ditambahkan', member);
  } catch (error) { next(error); }
});

// ========== ANALYTICS ==========
router.get('/analytics', async (req, res, next) => {
  try {
    const { enterpriseId, period = 'monthly' } = req.query;
    if (!enterpriseId) return badRequest(res, 'Enterprise ID wajib diisi');

    // Ambil data analitik
    const analytics = await prisma.enterpriseAnalytic.findMany({
      where: {
        enterpriseId: parseInt(enterpriseId),
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { date: 'asc' }
    });

    success(res, 'Data analitik', analytics);
  } catch (error) { next(error); }
});

module.exports = router;