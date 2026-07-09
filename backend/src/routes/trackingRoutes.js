// backend/src/routes/trackingRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, notFound, forbidden } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// ============================================
// GET TRACKING BY ORDER ID
// ============================================
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`📦 Tracking order ${orderId} for user ${userId} (${userRole})`);

    // Cari order dengan include product untuk cek seller
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                sellerId: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      console.log(`❌ Order ${orderId} not found`);
      return notFound(res, 'Pesanan tidak ditemukan');
    }

    // ✅ CEK AKSES: Buyer (pemilik order), Seller (punya produk di order), atau Admin
    const isOwner = order.userId === userId;
    const isSeller = order.items.some(item => item.product?.sellerId === userId);
    const isAdmin = userRole === 'ADMIN';

    console.log(`🔍 Access check: isOwner=${isOwner}, isSeller=${isSeller}, isAdmin=${isAdmin}`);

    if (!isOwner && !isSeller && !isAdmin) {
      console.log(`❌ Access denied for user ${userId}`);
      return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    console.log(`✅ Access granted for user ${userId}`);

    // ============================================
    // BUILD TRACKING HISTORY
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
    if (order.paymentStatus === 'PAID' || order.paymentStatus === 'VERIFIED' || order.paymentStatus === 'CONFIRMED') {
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
        description: 'Pesanan sedang diproses oleh penjual',
        location: 'Toko',
        createdAt: order.updatedAt,
        isCompleted: true,
        icon: '⚙️'
      });
    }

    // 4. Ready Pickup
    if (order.status === 'READY_PICKUP') {
      trackingHistory.push({
        status: 'READY_PICKUP',
        description: 'Pesanan siap diambil kurir',
        location: 'Toko',
        createdAt: order.updatedAt,
        isCompleted: true,
        icon: '📋'
      });
    }

    // 5. Shipped / In Transit
    if (order.status === 'SHIPPED' || order.status === 'IN_TRANSIT') {
      trackingHistory.push({
        status: 'SHIPPED',
        description: 'Pesanan dalam perjalanan',
        location: 'Dalam perjalanan',
        createdAt: order.shippedAt || order.updatedAt,
        isCompleted: false,
        icon: '🚚'
      });
    }

    // 6. Delivered
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

    // 7. Completed
    if (order.status === 'COMPLETED') {
      trackingHistory.push({
        status: 'COMPLETED',
        description: 'Pesanan selesai',
        location: order.address || 'Alamat tujuan',
        createdAt: order.completedAt || order.updatedAt,
        isCompleted: true,
        icon: '🎉'
      });
    }

    // 8. Cancelled
    if (order.status === 'CANCELLED') {
      trackingHistory.push({
        status: 'CANCELLED',
        description: 'Pesanan dibatalkan',
        location: '-',
        createdAt: order.cancelledAt || order.updatedAt,
        isCompleted: true,
        icon: '❌'
      });
    }

    // Sort by createdAt (oldest first)
    trackingHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // ============================================
    // RESPONSE DATA
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
        address: order.address,
        phone: order.phone,
        createdAt: order.createdAt,
        estimatedDelivery: order.deliveredAt 
          ? new Date(order.deliveredAt) 
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      trackingHistory: trackingHistory,
      currentStatus: order.status
    };

    success(res, 'Data tracking berhasil diambil', trackingData);
  } catch (error) {
    console.error('❌ Error fetching tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tracking',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;