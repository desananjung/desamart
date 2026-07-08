// backend/src/routes/courierRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // ← PASTIKAN INI ADA

const router = express.Router();

// ============================================
// GET COURIERS
// ============================================
router.get('/couriers', authenticate, async (req, res) => {
  try {
    const { village, available } = req.query;
    
    const where = {
      isActive: true,
      ...(village && { village: { contains: village, mode: 'insensitive' } }),
      ...(available && { available: available === 'true' })
    };
    
    const couriers = await prisma.villageCourier.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        // ✅ HAPUS email (tidak ada di model)
        // email: true,
        village: true,
        // ✅ HAPUS field yang tidak ada
        // subdistrict: true,
        // district: true,
        // province: true,
        vehicleType: true,
        // plateNumber: true,
        isActive: true,
        isVerified: true,
        rating: true,
        totalDeliveries: true,
        pricePerKm: true,
        // maxDistance: true,
        available: true,
        _count: {
          select: { deliveries: true }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalDeliveries: 'desc' }
      ]
    });
    
    res.json({
      success: true,
      message: 'Daftar kurir berhasil diambil',
      data: couriers,
      count: couriers.length
    });
  } catch (error) {
    console.error('Error fetching couriers:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar kurir',
      error: error.message
    });
  }
});

// ============================================
// GET COURIER BY ID
// ============================================
router.get('/couriers/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const courier = await prisma.villageCourier.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        phone: true,
        village: true,
        vehicleType: true,
        isActive: true,
        isVerified: true,
        rating: true,
        totalDeliveries: true,
        pricePerKm: true,
        available: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!courier) {
      return notFound(res, 'Kurir tidak ditemukan');
    }
    
    success(res, 'Detail kurir', courier);
  } catch (error) {
    console.error('Error fetching courier:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kurir',
      error: error.message
    });
  }
});

// ============================================
// CALCULATE COST
// ============================================
router.post('/calculate-cost', authenticate, async (req, res) => {
  try {
    const { courierId, distance, weight } = req.body;
    
    console.log('📦 Calculate cost request:', { courierId, distance, weight });
    
    if (!courierId) {
      return badRequest(res, 'Courier ID wajib diisi');
    }
    
    const courier = await prisma.villageCourier.findUnique({
      where: { id: parseInt(courierId) }
    });
    
    if (!courier) {
      return notFound(res, 'Kurir tidak ditemukan');
    }
    
    if (!courier.available) {
      return badRequest(res, 'Kurir sedang tidak tersedia');
    }
    
    const finalDistance = distance || 1;
    let cost = courier.pricePerKm * finalDistance;
    
    // Biaya minimum
    const minCost = 10000;
    if (cost < minCost) cost = minCost;
    
    // Estimasi waktu
    let estimatedTime = '30-60 menit';
    if (finalDistance > 10) {
      estimatedTime = '1-2 jam';
    } else if (finalDistance > 20) {
      estimatedTime = '2-4 jam';
    }
    
    res.json({
      success: true,
      message: 'Biaya pengiriman berhasil dihitung',
      data: {
        courier: {
          id: courier.id,
          name: courier.name,
          phone: courier.phone,
          vehicleType: courier.vehicleType
        },
        distance: finalDistance,
        weight: weight || 0,
        cost: Math.round(cost),
        estimatedTime: estimatedTime,
        pricePerKm: courier.pricePerKm,
        minCost: minCost
      }
    });
  } catch (error) {
    console.error('Error calculating cost:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghitung biaya pengiriman',
      error: error.message
    });
  }
});

// ============================================
// GET DELIVERY BY ORDER ID (FIX)
// ============================================
router.get('/deliveries/order/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // ✅ PASTIKAN prisma terdefinisi
    if (!prisma) {
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }
    
    const delivery = await prisma.delivery.findUnique({
      where: { orderId: parseInt(orderId) },
      include: {
        courier: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            rating: true,
            isVerified: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            shippingCost: true
          }
        }
      }
    });
    
    if (!delivery) {
      return notFound(res, 'Pengiriman tidak ditemukan');
    }
    
    success(res, 'Data pengiriman', delivery);
  } catch (error) {
    console.error('Error fetching delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengiriman',
      error: error.message
    });
  }
});

// ============================================
// CREATE DELIVERY
// ============================================
router.post('/deliveries', authenticate, async (req, res) => {
  try {
    const {
      orderId,
      courierId,
      pickupAddress,
      deliveryAddress,
      distance,
      cost,
      weight,
      notes,
      estimatedTime
    } = req.body;
    
    if (!orderId || !courierId || !pickupAddress || !deliveryAddress) {
      return badRequest(res, 'Semua field wajib diisi');
    }
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    const courier = await prisma.villageCourier.findUnique({
      where: { id: parseInt(courierId) }
    });
    
    if (!courier) {
      return notFound(res, 'Kurir tidak ditemukan');
    }
    
    // Buat delivery - pastikan model Delivery ada
    const delivery = await prisma.delivery.create({
      data: {
        orderId: parseInt(orderId),
        courierId: parseInt(courierId),
        pickupAddress,
        deliveryAddress,
        distance: distance || 0,
        cost: cost || 0,
        weight: weight || 0,
        notes: notes || '',
        estimatedTime: estimatedTime || '30-60 menit',
        status: 'PENDING'
      },
      include: {
        courier: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true
          }
        }
      }
    });
    
    // Update order
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: 'PROCESSING',
        shippingCost: cost || 0,
        courierName: courier.name,
        trackingStatus: 'PENDING'
      }
    });
    
    res.json({
      success: true,
      message: 'Pengiriman berhasil dibuat',
      data: delivery
    });
  } catch (error) {
    console.error('Error creating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat pengiriman',
      error: error.message
    });
  }
});

// ============================================
// UPDATE DELIVERY STATUS
// ============================================
router.put('/deliveries/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking, notes } = req.body;
    
    const validStatuses = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return badRequest(res, 'Status tidak valid');
    }
    
    const delivery = await prisma.delivery.findUnique({
      where: { id: parseInt(id) },
      include: {
        courier: true,
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!delivery) {
      return notFound(res, 'Pengiriman tidak ditemukan');
    }
    
    const updatedDelivery = await prisma.delivery.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        tracking: tracking || null,
        notes: notes || delivery.notes,
        ...(status === 'PICKED_UP' && { pickupTime: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      },
      include: {
        courier: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });
    
    // Update order status
    let orderStatus = 'PROCESSING';
    if (status === 'DELIVERED') {
      orderStatus = 'DELIVERED';
    } else if (status === 'CANCELLED') {
      orderStatus = 'CANCELLED';
    } else if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
      orderStatus = 'SHIPPED';
    }
    
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: {
        status: orderStatus,
        trackingStatus: status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() })
      }
    });
    
    res.json({
      success: true,
      message: 'Status pengiriman berhasil diperbarui',
      data: updatedDelivery
    });
  } catch (error) {
    console.error('Error updating delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal update status pengiriman',
      error: error.message
    });
  }
});

module.exports = router;