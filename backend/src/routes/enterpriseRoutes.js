const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound, conflict, created } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');
const enterpriseController = require('../controllers/enterpriseController');

const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authenticate);
router.post('/create', enterpriseController.createEnterprise);
router.get('/', enterpriseController.getEnterprise);
router.put('/update', enterpriseController.updateEnterprise);
router.post('/:enterpriseId/members', enterpriseController.addMember);
router.get('/stats', enterpriseController.getStats);

// ========== CREATE ENTERPRISE ==========
router.post('/create', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    console.log('📝 Creating enterprise for user:', userId);
    console.log('📦 Data:', data);

    // Validasi
    if (!data.name) return badRequest(res, 'Nama enterprise wajib diisi');
    if (!data.address) return badRequest(res, 'Alamat enterprise wajib diisi');
    if (!data.phone) return badRequest(res, 'Nomor telepon wajib diisi');

    // Cek user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { enterpriseOwner: true }
    });

    if (!user) return badRequest(res, 'User tidak ditemukan');
    if (user.enterpriseOwner) {
      return conflict(res, 'Anda sudah memiliki enterprise');
    }

    const slug = slugify(data.name, { lower: true, strict: true });
    
    const existing = await prisma.enterprise.findUnique({
      where: { slug }
    });
    if (existing) {
      return conflict(res, 'Nama enterprise sudah digunakan');
    }

    const enterprise = await prisma.enterprise.create({
      data: {
        name: data.name,
        slug,
        description: data.description || '',
        type: data.type || 'UMKM',
        address: data.address,
        phone: data.phone,
        email: data.email || '',
        website: data.website || '',
        logo: data.logo || '',
        banner: data.banner || '',
        ownerId: userId,
        status: 'ACTIVE'
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('✅ Enterprise created:', enterprise);
    created(res, 'Enterprise berhasil dibuat', enterprise);
  } catch (error) {
    console.error('❌ Error creating enterprise:', error);
    next(error);
  }
});

// ========== GET ENTERPRISE ==========
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        },
        stores: {
          include: {
            store: {
              include: {
                products: {
                  take: 5,
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        },
        products: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            members: true,
            stores: true,
            products: true,
            orders: true
          }
        }
      }
    });

    if (!enterprise) {
      return success(res, 'Belum memiliki enterprise', null);
    }
    success(res, 'Data enterprise', enterprise);
  } catch (error) {
    console.error('❌ Error fetching enterprise:', error);
    next(error);
  }
});

// ========== UPDATE ENTERPRISE ==========
router.put('/update', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    const enterprise = await prisma.enterprise.findFirst({
      where: { ownerId: userId }
    });

    if (!enterprise) {
      return notFound(res, 'Enterprise tidak ditemukan');
    }

    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.address) updateData.address = data.address;
    if (data.phone) updateData.phone = data.phone;
    if (data.email) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.banner !== undefined) updateData.banner = data.banner;

    const updated = await prisma.enterprise.update({
      where: { id: enterprise.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    success(res, 'Enterprise berhasil diperbarui', updated);
  } catch (error) {
    console.error('❌ Error updating enterprise:', error);
    next(error);
  }
});

// ========== GET STATS ==========
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const enterprise = await prisma.enterprise.findFirst({
      where: { ownerId: userId },
      include: {
        stores: { include: { store: true } },
        products: true,
        orders: true,
        members: true
      }
    });

    if (!enterprise) {
      return success(res, 'Belum memiliki enterprise', null);
    }

    // Hitung pendapatan
    const revenue = await prisma.order.aggregate({
      where: {
        enterpriseOrders: {
          some: {
            enterpriseId: enterprise.id
          }
        },
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
      },
      _sum: {
        total: true
      }
    });

    const stats = {
      enterprise,
      stats: {
        totalMembers: enterprise.members.length,
        totalStores: enterprise.stores.length,
        totalProducts: enterprise.products.length,
        totalOrders: enterprise.orders.length,
        totalRevenue: revenue._sum.total || 0
      }
    };

    success(res, 'Statistik enterprise', stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    next(error);
  }
});

// ========== ADD MEMBER ==========
router.post('/:enterpriseId/members', async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;
    const { userId, role, permissions } = req.body;

    if (!userId) return badRequest(res, 'User ID wajib diisi');

    const enterprise = await prisma.enterprise.findUnique({
      where: { id: parseInt(enterpriseId) }
    });
    if (!enterprise) return notFound(res, 'Enterprise tidak ditemukan');

    const existing = await prisma.enterpriseMember.findFirst({
      where: { 
        enterpriseId: parseInt(enterpriseId), 
        userId: parseInt(userId) 
      }
    });
    if (existing) return conflict(res, 'User sudah menjadi anggota');

    const member = await prisma.enterpriseMember.create({
      data: {
        enterpriseId: parseInt(enterpriseId),
        userId: parseInt(userId),
        role: role || 'STAFF',
        permissions: permissions || {}
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    success(res, 'Anggota berhasil ditambahkan', member);
  } catch (error) {
    console.error('❌ Error adding member:', error);
    next(error);
  }
});

// ========== ADD STORE TO ENTERPRISE ==========
router.post('/:enterpriseId/stores', async (req, res, next) => {
  try {
    const { enterpriseId } = req.params;
    const { storeId, name } = req.body;

    if (!storeId) {
      return badRequest(res, 'Store ID wajib diisi');
    }

    const enterprise = await prisma.enterprise.findUnique({
      where: { id: parseInt(enterpriseId) }
    });
    if (!enterprise) return notFound(res, 'Enterprise tidak ditemukan');

    // Cek apakah store sudah ada di enterprise
    const existing = await prisma.enterpriseStore.findFirst({
      where: {
        enterpriseId: parseInt(enterpriseId),
        storeId: parseInt(storeId)
      }
    });
    if (existing) return conflict(res, 'Toko sudah ada di enterprise');

    // Cek store milik user
    const store = await prisma.store.findUnique({
      where: { id: parseInt(storeId) }
    });
    if (!store) return notFound(res, 'Toko tidak ditemukan');

    const enterpriseStore = await prisma.enterpriseStore.create({
      data: {
        enterpriseId: parseInt(enterpriseId),
        storeId: parseInt(storeId),
        name: name || store.name,
        isActive: true
      },
      include: {
        store: true
      }
    });

    success(res, 'Toko berhasil ditambahkan ke enterprise', enterpriseStore);
  } catch (error) {
    console.error('❌ Error adding store:', error);
    next(error);
  }
});

module.exports = router;