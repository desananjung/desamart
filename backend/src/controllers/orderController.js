// backend/src/controllers/orderController.js
// COPY PASTE SEMUA KODE INI

const orderService = require('../services/orderService');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../utils/notificationHelper');

const ADMIN_ID = 1;

// ============================================
// CREATE ORDER
// ============================================
const createOrder = async (req, res, next) => {
  try {
    const { address, phone, note, shippingMethod, shippingCost, courierId } = req.body;
    
    if (!address || !phone) {
      return badRequest(res, 'Alamat dan nomor telepon wajib diisi');
    }
    
    const order = await orderService.createOrder(
      req.user.id, 
      address, 
      phone, 
      note,
      shippingMethod,
      shippingCost,
      courierId
    );
    
    await createNotification(
      req.user.id,
      'ORDER',
      '📦 Pesanan Dibuat',
      `Pesanan #${order.id} berhasil dibuat. Silakan selesaikan pembayaran.`,
      { orderId: order.id }
    );
    
    await createNotification(
      ADMIN_ID,
      'ORDER',
      '📦 Pesanan Baru',
      `Pesanan baru #${order.id} dari ${req.user.name}`,
      { orderId: order.id }
    );
    
    await sendSellerNotifications(order);
    
    created(res, 'Pesanan berhasil dibuat', order);
  } catch (error) {
    if (error.message === 'Keranjang belanja kosong') return badRequest(res, error.message);
    if (error.message.includes('Stok')) return badRequest(res, error.message);
    next(error);
  }
};

// ============================================
// GET MY ORDERS
// ============================================
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      userId: userId,
      ...(status && { status: status })
    };
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true
                }
              }
            }
          },
          payments: true,
          shipping: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);
    
    const formattedOrders = orders.map(order => ({
      ...order,
      totalAmount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));
    
    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pesanan',
      error: error.message
    });
  }
};

// ============================================
// GET ORDER DETAIL
// ============================================
const getOrderDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
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
        },
        payments: true,
        shipping: true
      }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    // ✅ CEK AKSES: Buyer, Seller, atau Admin
    const isOwner = order.userId === userId;
    const isSeller = order.items.some(item => item.product?.sellerId === userId);
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isSeller && !isAdmin) {
      return forbidden(res, 'Anda tidak memiliki akses ke pesanan ini');
    }
    
    const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      data: {
        ...order,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail pesanan',
      error: error.message
    });
  }
};

// ============================================
// PROCESS PAYMENT
// ============================================
const processPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, shippingMethod, shippingCost, courierName, courierId } = req.body;
    
    if (!paymentMethod) {
      return badRequest(res, 'Metode pembayaran wajib dipilih');
    }
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                sellerId: true
              }
            }
          } 
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    if (order.userId !== req.user.id) {
      return forbidden(res, 'Anda tidak memiliki akses');
    }
    
    if (order.status !== 'PENDING') {
      return badRequest(res, 'Pesanan sudah diproses');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentMethod,
        shippingMethod,
        shippingCost: shippingCost || 0,
        courierName: courierName || null,
        courierId: courierId ? parseInt(courierId) : null,
        status: 'WAITING_PAYMENT',
        paymentStatus: 'UNPAID'
      }
    });
    
    await createNotification(
      ADMIN_ID,
      'PAYMENT',
      '💳 Pesanan Siap Dibayar',
      `Pesanan #${orderId} oleh ${order.User?.name} siap dibayar dengan metode ${paymentMethod}`,
      { orderId }
    );
    
    res.json({
      success: true,
      message: 'Pesanan siap dibayar',
      data: updated
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pembayaran',
      error: error.message
    });
  }
};

// ============================================
// UPLOAD BUKTI TRANSFER
// ============================================
const uploadPaymentProof = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentProof, senderName } = req.body;
    
    if (!paymentProof) {
      return badRequest(res, 'Bukti transfer wajib diupload');
    }
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    if (order.userId !== req.user.id) {
      return forbidden(res, 'Anda tidak memiliki akses');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentProof,
        paymentStatus: 'WAITING_VERIFICATION',
        status: 'WAITING_PAYMENT'
      }
    });
    
    await createNotification(
      ADMIN_ID,
      'PAYMENT',
      '💳 Bukti Transfer Baru',
      `Ada bukti transfer baru untuk pesanan #${orderId}`,
      { orderId, paymentProof }
    );
    
    success(res, 'Bukti transfer berhasil diupload', updated);
  } catch (error) {
    next(error);
  }
};

// ============================================
// VERIFY PAYMENT
// ============================================
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                sellerId: true
              }
            }
          } 
        } 
      }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    if (order.paymentStatus !== 'WAITING_VERIFICATION') {
      return badRequest(res, 'Pesanan tidak dalam status menunggu verifikasi');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: 'VERIFIED',
        status: 'PAYMENT_VERIFIED',
        paymentVerifiedAt: new Date(),
        verifiedBy: req.user.id
      }
    });
    
    await createNotification(
      order.userId,
      'PAYMENT',
      '✅ Pembayaran Diverifikasi',
      `Pembayaran untuk pesanan #${orderId} telah diverifikasi.`,
      { orderId }
    );
    
    const sellerIds = [];
    for (const item of order.items) {
      if (item.product?.sellerId && !sellerIds.includes(item.product.sellerId)) {
        sellerIds.push(item.product.sellerId);
        await createNotification(
          item.product.sellerId,
          'PAYMENT',
          '💰 Pembayaran Masuk',
          `Pembayaran untuk produk "${item.product.name}" telah masuk.`,
          { orderId, productName: item.product.name }
        );
      }
    }
    
    await createNotification(
      ADMIN_ID,
      'PAYMENT',
      '💰 Pembayaran Diverifikasi',
      `Pembayaran untuk pesanan #${orderId} telah diverifikasi.`,
      { orderId }
    );
    
    success(res, 'Pembayaran berhasil diverifikasi', updated);
  } catch (error) {
    next(error);
  }
};

// ============================================
// SELLER - UPDATE STATUS
// ============================================
const updateSellerOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const sellerId = req.user.id;
    
    const validStatuses = ['PROCESSING', 'READY_PICKUP'];
    if (!validStatuses.includes(status)) {
      return badRequest(res, 'Status tidak valid untuk penjual');
    }
    
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        items: {
          some: {
            product: {
              sellerId: sellerId
            }
          }
        }
      },
      include: { 
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    if (order.status !== 'PAYMENT_VERIFIED') {
      return badRequest(res, 'Pesanan belum siap diproses');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    const buyerMessages = {
      'PROCESSING': 'Penjual sedang memproses pesanan Anda',
      'READY_PICKUP': 'Pesanan Anda siap diambil kurir'
    };
    
    await createNotification(
      order.userId,
      'ORDER',
      `📦 ${status === 'PROCESSING' ? 'Pesanan Diproses' : 'Siap Diambil'}`,
      buyerMessages[status],
      { orderId: id }
    );
    
    await createNotification(
      ADMIN_ID,
      'ORDER',
      `📦 Pesanan ${status === 'PROCESSING' ? 'Diproses' : 'Siap Diambil'}`,
      `Pesanan #${id} oleh ${order.user?.name} ${status === 'PROCESSING' ? 'sedang diproses' : 'siap diambil'}`,
      { orderId: id }
    );
    
    if (status === 'READY_PICKUP') {
      await createNotification(
        order.courierId || 0,
        'ORDER',
        '📦 Barang Siap Diambil',
        `Ada barang siap diambil untuk pesanan #${id}`,
        { orderId: id }
      );
    }
    
    success(res, 'Status pesanan diperbarui', updated);
  } catch (error) {
    next(error);
  }
};

// ============================================
// COURIER - UPDATE STATUS
// ============================================
const updateCourierStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location, note } = req.body;
    const courierId = req.user.id;
    
    const validStatuses = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return badRequest(res, 'Status tidak valid untuk kurir');
    }
    
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        courierId: courierId
      },
      include: { user: true }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(status === 'PICKED_UP' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        ...(location && { trackingStatus: location })
      }
    });
    
    const buyerMessages = {
      'PICKED_UP': 'Kurir telah mengambil barang Anda',
      'IN_TRANSIT': 'Barang Anda sedang dalam perjalanan',
      'DELIVERED': 'Barang Anda telah sampai!'
    };
    
    await createNotification(
      order.userId,
      'SHIPPING',
      `🚚 ${status === 'DELIVERED' ? 'Barang Sampai' : 'Barang Diantar'}`,
      buyerMessages[status],
      { orderId: id, location }
    );
    
    success(res, 'Status pengiriman diperbarui', updated);
  } catch (error) {
    next(error);
  }
};

// ============================================
// BUYER - CONFIRM RECEIVED
// ============================================
const confirmReceived = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    if (order.userId !== userId) {
      return forbidden(res, 'Anda tidak memiliki akses');
    }
    
    if (order.status !== 'DELIVERED') {
      return badRequest(res, 'Barang belum sampai');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    const sellerId = order.items[0]?.product?.sellerId;
    if (sellerId) {
      await createNotification(
        sellerId,
        'ORDER',
        '🎉 Pesanan Selesai',
        `Pesanan #${id} telah selesai. Dana akan segera dicairkan.`,
        { orderId: id }
      );
    }
    
    await createNotification(
      ADMIN_ID,
      'ORDER',
      '💰 Pencairan Dana',
      `Pesanan #${id} selesai. Waktunya mencairkan dana ke penjual.`,
      { orderId: id }
    );
    
    success(res, 'Pesanan selesai', updated);
  } catch (error) {
    next(error);
  }
};

// ============================================
// ADMIN - RELEASE ESCROW
// ============================================
const releaseEscrow = async (req, res, next) => {
  try {
    success(res, 'Fitur escrow sedang dalam pengembangan');
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ORDER HISTORY
// ============================================
const getOrderHistory = async (req, res, next) => {
  try {
    success(res, 'Fitur riwayat pesanan sedang dalam pengembangan');
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE STATUS (Admin)
// ============================================
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return badRequest(res, 'Status tidak valid');
    }
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    res.json({
      success: true,
      message: 'Status pesanan diperbarui',
      data: updated
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal update status',
      error: error.message
    });
  }
};

// ============================================
// GET SELLER ORDERS
// ============================================
const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    console.log(`📦 SELLER ORDERS - Seller ID: ${sellerId}`);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      items: {
        some: {
          product: {
            sellerId: sellerId
          }
        }
      },
      ...(status && { status: status })
    };
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
          },
          payments: true,
          shipping: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);
    
    console.log(`✅ Found ${orders.length} orders for seller ${sellerId}`);
    
    const formattedOrders = orders.map(order => ({
      ...order,
      totalAmount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));
    
    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil pesanan',
      error: error.message
    });
  }
};

// ============================================
// HELPER: SEND SELLER NOTIFICATIONS
// ============================================
async function sendSellerNotifications(order) {
  try {
    const sellerIds = [];
    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { sellerId: true, name: true }
      });
      if (product && !sellerIds.includes(product.sellerId)) {
        sellerIds.push(product.sellerId);
        
        await createNotification(
          product.sellerId,
          'SELLER',
          '🛒 Pesanan Baru',
          `Ada pesanan baru untuk produk "${product.name}".`,
          { orderId: order.id }
        );
      }
    }
  } catch (error) {
    console.error('Error sending seller notifications:', error);
  }
}

// ============================================
// MODULE EXPORTS
// ============================================
module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
  processPayment,
  uploadPaymentProof,
  verifyPayment,
  updateSellerOrderStatus,
  updateCourierStatus,
  confirmReceived,
  releaseEscrow,
  getOrderHistory,
  updateStatus,
  getSellerOrders
};