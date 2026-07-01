const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

const getStoreBySeller = async (sellerId) => {
  let store = await prisma.store.findUnique({
    where: { sellerId },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });
  
  if (!store) {
    // Buat toko default jika belum ada
    const user = await prisma.user.findUnique({
      where: { id: sellerId }
    });
    const slug = slugify(user.name + '-store', { lower: true, strict: true });
    store = await prisma.store.create({
      data: {
        name: user.name + ' Store',
        slug,
        sellerId,
        isActive: true
      },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }
  return store;
};

const updateStore = async (sellerId, data) => {
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) throw new Error('Toko tidak ditemukan');
  
  const updateData = {};
  if (data.name) {
    updateData.name = data.name;
    updateData.slug = slugify(data.name, { lower: true, strict: true });
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.logo !== undefined) updateData.logo = data.logo;
  if (data.banner !== undefined) updateData.banner = data.banner;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.phone !== undefined) updateData.phone = data.phone;
  
  return await prisma.store.update({
    where: { sellerId },
    data: updateData,
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });
};

const getStoreStats = async (sellerId) => {
  const [totalProducts, totalOrders, totalRevenue] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.order.count({
      where: {
        items: {
          some: {
            product: { sellerId }
          }
        },
        status: { not: 'CANCELLED' }
      }
    }),
    prisma.order.aggregate({
      where: {
        items: {
          some: {
            product: { sellerId }
          }
        },
        status: 'DELIVERED'
      },
      _sum: {
        total: true
      }
    })
  ]);

  // Hitung rating dari ulasan (akan ditambahkan nanti)
  const averageRating = 4.5;

  return {
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    averageRating,
    storeName: (await prisma.store.findUnique({ where: { sellerId } }))?.name || 'Toko Saya'
  };
};

const getSellerOrders = async (sellerId, status = null) => {
  const where = {
    items: {
      some: {
        product: { sellerId }
      }
    }
  };
  if (status) {
    where.status = status;
  }
  
  return await prisma.order.findMany({
    where,
    include: {
      user: {
        select: { name: true, email: true }
      },
      items: {
        where: {
          product: { sellerId }
        },
        include: {
          product: {
            select: { name: true, imageUrl: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const updateOrderStatus = async (orderId, status, sellerId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  if (!order) throw new Error('Pesanan tidak ditemukan');
  
  // Cek apakah pesanan milik seller ini
  const hasSellerProduct = order.items.some(item => item.product.sellerId === sellerId);
  if (!hasSellerProduct) throw new Error('Anda tidak memiliki akses ke pesanan ini');
  
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) throw new Error('Status tidak valid');
  
  return await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: { name: true, email: true }
      },
      items: {
        include: {
          product: {
            select: { name: true, imageUrl: true }
          }
        }
      }
    }
  });
};

module.exports = {
  getStoreBySeller,
  updateStore,
  getStoreStats,
  getSellerOrders,
  updateOrderStatus
};