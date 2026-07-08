// backend/src/routes/trackingRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, notFound, forbidden } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// ============================================
// GET TRACKING BY ORDER ID - VERSI SEDERHANA
// ============================================
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`📦 Tracking order ${orderId} for user ${userId}`);

    // ✅ CARI ORDER TANPA INCLUDE (yang bermasalah)
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      console.log(`❌ Order ${orderId} not found`);
      return notFound(res, 'Pesanan tidak ditemukan');
    }

    console.log(`✅ Order ${orderId} found, status: ${order.status}`);
    console.log(`📦 Order data:`, {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      address: order.address,
      phone: order.phone
    });

    // Cek akses
    if (order.userId !== userId && userRole !== 'ADMIN') {
      return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    // ============================================
    // TRACKING HISTORY SEDERHANA
    // ============================================
    const trackingHistory = [];

    // 1. Order Created
    trackingHistory.push({
      status: 'CREATED',
      description: 'Pesanan berhasil dibuat',
      location: 'DesaMart',
      createdAt: order.createdAt,
      isCompleted: true,
      icon: '📦'
    });

    // 2. Payment
    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'VERIFIED') {
      trackingHistory.push({
        status: 'PAYMENT_VERIFIED',
        description: 'Pembayaran telah diverifikasi',
        location: 'DesaMart',
        createdAt: order.paidAt || order.updatedAt,
        isCompleted: true,
        icon: '✅'
      });
    }

    // 3. Processing
    if (order.status === 'PROCESSING') {
      trackingHistory.push({
        status: 'PROCESSING',
        description: 'Pesanan sedang diproses',
        location: 'Toko',
        createdAt: order.updatedAt,
        isCompleted: true,
        icon: '⚙️'
      });
    }

    // 4. Shipped / In Transit
    if (order.status === 'SHIPPED' || order.status === 'IN_TRANSIT') {
      trackingHistory.push({
        status: 'SHIPPED',
        description: 'Pesanan dalam perjalanan',
        location: 'Dalam perjalanan',
        createdAt: order.updatedAt,
        isCompleted: false,
        icon: '🚚'
      });
    }

    // 5. Delivered
    if (order.status === 'DELIVERED') {
      trackingHistory.push({
        status: 'DELIVERED',
        description: 'Pesanan telah sampai',
        location: order.address || 'Alamat tujuan',
        createdAt: order.deliveredAt || order.updatedAt,
        isCompleted: true,
        icon: '✅'
      });
    }

    // 6. Completed
    if (order.status === 'COMPLETED') {
      trackingHistory.push({
        status: 'COMPLETED',
        description: 'Pesanan selesai',
        location: order.address || 'Alamat tujuan',
        createdAt: order.updatedAt,
        isCompleted: true,
        icon: '🎉'
      });
    }

    // 7. Cancelled
    if (order.status === 'CANCELLED') {
      trackingHistory.push({
        status: 'CANCELLED',
        description: 'Pesanan dibatalkan',
        location: '-',
        createdAt: order.updatedAt,
        isCompleted: true,
        icon: '❌'
      });
    }

    // Sort by createdAt
    trackingHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // ============================================
    // RESPONSE
    // ============================================
    const trackingData = {
      order: {
        id: order.id,
        orderNumber: order.orderNumber || `ORD-${String(order.id).padStart(3, '0')}`,
        status: order.status,
        total: order.total,
        shippingCost: order.shippingCost || 0,
        grandTotal: order.total + (order.shippingCost || 0),
        courier: order.courierName || 'Belum ditentukan',
        trackingNumber: order.shippingNumber || '-',
        createdAt: order.createdAt,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      trackingHistory: trackingHistory,
      currentStatus: order.status
    };

    console.log('✅ Tracking data sent');
    success(res, 'Data tracking berhasil diambil', trackingData);
  } catch (error) {
    console.error('❌ Error fetching tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tracking',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;