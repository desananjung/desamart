// backend/routes/courierRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/authMiddleware');

const prisma = new PrismaClient();

// ============================================
// GET ALL COURIERS (Public - dengan filter)
// ============================================
router.get('/couriers', async (req, res) => {
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
        email: true,
        village: true,
        subdistrict: true,
        district: true,
        province: true,
        vehicleType: true,
        plateNumber: true,
        isActive: true,
        isVerified: true,
        rating: true,
        totalDeliveries: true,
        pricePerKm: true,
        maxDistance: true,
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
      include: {
        deliveries: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                totalAmount: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: { deliveries: true }
        }
      }
    });
    
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Kurir tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Data kurir berhasil diambil',
      data: courier
    });
  } catch (error) {
    console.error('Error fetching courier:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kurir',
      error: error.message
    });
  }
});

// ============================================
// CALCULATE DELIVERY COST
// ============================================
router.post('/calculate-cost', async (req, res) => {
  try {
    const { courierId, distance, weight } = req.body;
    
    console.log('📦 Calculate cost request:', { courierId, distance, weight });
    
    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: 'Courier ID wajib diisi'
      });
    }
    
    const courier = await prisma.villageCourier.findUnique({
      where: { id: parseInt(courierId) }
    });
    
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Kurir tidak ditemukan'
      });
    }
    
    if (!courier.available) {
      return res.status(400).json({
        success: false,
        message: 'Kurir sedang tidak tersedia'
      });
    }
    
    // Hitung biaya
    let finalDistance = distance || 1;
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
        minCost: minCost,
        maxDistance: courier.maxDistance
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
// CREATE DELIVERY
// ============================================
router.post('/deliveries', async (req, res) => {
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
    
    // Validasi
    if (!orderId || !courierId || !pickupAddress || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }
    
    // Cek order
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      });
    }
    
    // Cek courier
    const courier = await prisma.villageCourier.findUnique({
      where: { id: parseInt(courierId) }
    });
    
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Kurir tidak ditemukan'
      });
    }
    
    // Buat delivery
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
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true
          }
        }
      }
    });
    
    // Update order status
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: 'PROCESSING',
        shippingCost: cost || 0,
        courier: courier.name,
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
    
    // Validasi status
    const validStatuses = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }
    
    // Cek delivery
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
      return res.status(404).json({
        success: false,
        message: 'Pengiriman tidak ditemukan'
      });
    }
    
    // Update delivery
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
    
    // Update rating courier jika selesai
    if (status === 'DELIVERED') {
      await prisma.villageCourier.update({
        where: { id: delivery.courierId },
        data: {
          totalDeliveries: {
            increment: 1
          }
        }
      });
    }
    
    // Buat notifikasi
    await prisma.notification.create({
      data: {
        userId: delivery.order.userId,
        type: 'ORDER',
        title: `🚚 Status Pengiriman: ${status}`,
        message: `Pesanan #${delivery.order.orderNumber || delivery.orderId} ${getStatusMessage(status)}`,
        data: {
          orderId: delivery.orderId,
          deliveryId: delivery.id,
          status: status
        }
      }
    });
    
    res.json({
      success: true,
      message: 'Status pengiriman berhasil diperbarui',
      data: {
        delivery: updatedDelivery,
        orderStatus: orderStatus
      }
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

// ============================================
// GET DELIVERY BY ORDER ID
// ============================================
router.get('/deliveries/order/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
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
            totalAmount: true,
            status: true,
            shippingCost: true
          }
        }
      }
    });
    
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Pengiriman tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      message: 'Data pengiriman berhasil diambil',
      data: delivery
    });
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
// GET USER DELIVERIES
// ============================================
router.get('/my-deliveries', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    const where = {
      order: {
        userId: userId
      },
      ...(status && { status: status })
    };
    
    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        courier: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            rating: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      message: 'Daftar pengiriman berhasil diambil',
      data: deliveries,
      count: deliveries.length
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pengiriman',
      error: error.message
    });
  }
});

// ============================================
// CREATE VILLAGE COURIER (Admin Only)
// ============================================
router.post('/admin/couriers', authenticate, async (req, res) => {
  try {
    // Cek apakah user adalah admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }
    
    const {
      name,
      phone,
      email,
      village,
      subdistrict,
      district,
      province,
      vehicleType,
      plateNumber,
      pricePerKm,
      maxDistance
    } = req.body;
    
    // Validasi
    if (!name || !phone || !village || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, village, dan vehicleType wajib diisi'
      });
    }
    
    const courier = await prisma.villageCourier.create({
      data: {
        name,
        phone,
        email: email || null,
        village,
        subdistrict: subdistrict || null,
        district: district || null,
        province: province || null,
        vehicleType,
        plateNumber: plateNumber || null,
        pricePerKm: pricePerKm || 5000,
        maxDistance: maxDistance || null,
        isActive: true,
        isVerified: false,
        available: true
      }
    });
    
    res.json({
      success: true,
      message: 'Kurir berhasil ditambahkan',
      data: courier
    });
  } catch (error) {
    console.error('Error creating courier:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kurir',
      error: error.message
    });
  }
});

// ============================================
// UPDATE COURIER (Admin Only)
// ============================================
router.put('/admin/couriers/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }
    
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      village,
      subdistrict,
      district,
      province,
      vehicleType,
      plateNumber,
      pricePerKm,
      maxDistance,
      isActive,
      isVerified,
      available
    } = req.body;
    
    const courier = await prisma.villageCourier.update({
      where: { id: parseInt(id) },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        email: email || undefined,
        village: village || undefined,
        subdistrict: subdistrict || undefined,
        district: district || undefined,
        province: province || undefined,
        vehicleType: vehicleType || undefined,
        plateNumber: plateNumber || undefined,
        pricePerKm: pricePerKm || undefined,
        maxDistance: maxDistance || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        isVerified: isVerified !== undefined ? isVerified : undefined,
        available: available !== undefined ? available : undefined
      }
    });
    
    res.json({
      success: true,
      message: 'Data kurir berhasil diperbarui',
      data: courier
    });
  } catch (error) {
    console.error('Error updating courier:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data kurir',
      error: error.message
    });
  }
});

// ============================================
// DELETE COURIER (Admin Only)
// ============================================
router.delete('/admin/couriers/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }
    
    const { id } = req.params;
    
    await prisma.villageCourier.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: 'Kurir berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting courier:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kurir',
      error: error.message
    });
  }
});

// ============================================
// HELPER FUNCTION
// ============================================
function getStatusMessage(status) {
  const messages = {
    'PENDING': 'menunggu konfirmasi kurir',
    'ASSIGNED': 'telah ditugaskan ke kurir',
    'PICKED_UP': 'telah diambil kurir',
    'IN_TRANSIT': 'sedang dalam perjalanan',
    'DELIVERED': 'telah sampai tujuan',
    'CANCELLED': 'dibatalkan'
  };
  return messages[status] || status;
}

module.exports = router;