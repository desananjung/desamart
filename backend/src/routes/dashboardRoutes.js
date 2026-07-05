const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.use(authenticate);

router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {
      orders: 0,
      products: 0,
      revenue: 0,
      customers: 0,
      totalSpent: 0,
      totalSellers: 0,
      totalBuyers: 0,
      totalUMKM: 0
    };

    // ============================================
    // UNTUK ADMIN - Lihat semua data platform
    // ============================================
    if (userRole === 'ADMIN') {
      // Total semua pesanan
      const totalOrders = await prisma.order.count();
      stats.orders = totalOrders;

      // Total semua produk
      const totalProducts = await prisma.product.count();
      stats.products = totalProducts;

      // Total pendapatan semua seller (dari semua pesanan yang selesai)
      const revenue = await prisma.order.aggregate({
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: {
          total: true
        }
      });
      stats.revenue = revenue._sum.total || 0;

      // Total pelanggan (buyer yang pernah transaksi)
      const customers = await prisma.order.groupBy({
        by: ['userId'],
        where: {
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      });
      stats.customers = customers.length;

      // Total seller
      const sellers = await prisma.user.count({
        where: { role: 'SELLER' }
      });
      stats.totalSellers = sellers;

      // Total buyer
      const buyers = await prisma.user.count({
        where: { role: 'BUYER' }
      });
      stats.totalBuyers = buyers;

      // Total UMKM
      const umkm = await prisma.uMKM.count();
      stats.totalUMKM = umkm;

      return success(res, 'Dashboard stats (Admin)', stats);
    }

    // ============================================
    // UNTUK SELLER
    // ============================================
    if (userRole === 'SELLER') {
      // Total pesanan yang membeli produk seller
      const orders = await prisma.order.findMany({
        where: {
          items: {
            some: {
              product: {
                sellerId: userId
              }
            }
          }
        }
      });
      stats.orders = orders.length;

      // Total produk seller
      const products = await prisma.product.count({
        where: { sellerId: userId }
      });
      stats.products = products;

      // Total pendapatan seller
      const revenue = await prisma.order.aggregate({
        where: {
          items: {
            some: {
              product: {
                sellerId: userId
              }
            }
          },
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: {
          total: true
        }
      });
      stats.revenue = revenue._sum.total || 0;

      // Total pelanggan seller
      const customers = await prisma.order.groupBy({
        by: ['userId'],
        where: {
          items: {
            some: {
              product: {
                sellerId: userId
              }
            }
          },
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      });
      stats.customers = customers.length;

      return success(res, 'Dashboard stats (Seller)', stats);
    }

    // ============================================
    // UNTUK BUYER
    // ============================================
    if (userRole === 'BUYER') {
      // Total pesanan buyer
      const orders = await prisma.order.count({
        where: { userId }
      });
      stats.orders = orders;

      // Total belanja buyer
      const totalSpent = await prisma.order.aggregate({
        where: {
          userId: userId,
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: {
          total: true
        }
      });
      stats.totalSpent = totalSpent._sum.total || 0;

      return success(res, 'Dashboard stats (Buyer)', stats);
    }

    // Default
    success(res, 'Dashboard stats', stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(error);
  }
});

module.exports = router;