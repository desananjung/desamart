// backend/src/controllers/orderController.js
const orderService = require('../services/orderService');
const orderHistoryService = require('../services/orderHistoryService');
const escrowService = require('../services/escrowService');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../utils/notificationHelper');

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
    
    await orderHistoryService.addOrderHistory(
      order.id,
      'PENDING',
      'Pesanan berhasil dibuat',
      req.user.id,
      'BUYER',
      'Menunggu pembayaran'
    );
    
    await createNotification(
      req.user.id,
      'ORDER',
      '📦 Pesanan Dibuat',
      `Pesanan #${order.id} berhasil dibuat. Silakan selesaikan pembayaran.`,
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
          shipping: true,
          history: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);
    
    const formattedOrders = orders.map(order => ({
      ...order,
      currentStatus: order.history?.[0]?.status || order.status,
      lastUpdate: order.history?.[0]?.createdAt || order.updatedAt,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
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
        shipping: true,
        history: {
          orderBy: { createdAt: 'asc' }
        },
        escrow: true
      }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    const isOwner = order.userId === userId;
    const isSeller = order.items.some(item => item.product.sellerId === userId);
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
      include: { items: { include: { product: true } } }
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
    
    await orderHistoryService.addOrderHistory(
      orderId,
      'WAITING_PAYMENT',
      'Menunggu pembayaran',
      req.user.id,
      'BUYER',
      `Metode: ${paymentMethod}`
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
    
    await orderHistoryService.addOrderHistory(
      orderId,
      'WAITING_PAYMENT',
      'Bukti transfer telah diupload',
      req.user.id,
      'BUYER',
      'Menunggu verifikasi pembayaran'
    );
    
    await createNotification(
      1,
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
// VERIFY PAYMENT (Admin)
// ============================================
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: { include: { product: true } } }
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
    
    const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const sellerId = order.items[0]?.product?.sellerId;
    
    if (sellerId) {
      await escrowService.createEscrow(orderId, sellerId, totalAmount);
    }
    
    await orderHistoryService.addOrderHistory(
      orderId,
      'PAYMENT_VERIFIED',
      'Pembayaran berhasil diverifikasi',
      req.user.id,
      'ADMIN',
      note || 'Pembayaran valid'
    );
    
    await createNotification(
      order.userId,
      'PAYMENT',
      '✅ Pembayaran Diverifikasi',
      `Pembayaran untuk pesanan #${orderId} telah diverifikasi.`,
      { orderId }
    );
    
    await createNotification(
      sellerId,
      'PAYMENT',
      '💰 Pembayaran Masuk',
      `Pembayaran untuk pesanan #${orderId} telah masuk dan ditahan di escrow.`,
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
      include: { user: true }
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
    
    const statusDescriptions = {
      'PROCESSING': 'Penjual sedang memproses pesanan',
      'READY_PICKUP': 'Pesanan siap diambil kurir'
    };
    
    await orderHistoryService.addOrderHistory(
      id,
      status,
      statusDescriptions[status],
      req.user.id,
      'SELLER',
      note || ''
    );
    
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
    
    const statusDescriptions = {
      'PICKED_UP': 'Kurir telah mengambil barang',
      'IN_TRANSIT': 'Barang sedang dalam perjalanan',
      'DELIVERED': 'Barang telah sampai tujuan'
    };
    
    await orderHistoryService.addOrderHistory(
      id,
      status,
      statusDescriptions[status],
      req.user.id,
      'COURIER',
      note || '',
      location || null
    );
    
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
    
    await orderHistoryService.addOrderHistory(
      id,
      'COMPLETED',
      'Pembeli telah menerima barang',
      req.user.id,
      'BUYER',
      'Pesanan selesai'
    );
    
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
      1,
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
    const { orderId } = req.params;
    const { transferProof, transferNote } = req.body;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    if (order.status !== 'COMPLETED') {
      return badRequest(res, 'Pesanan belum selesai');
    }
    
    const escrow = await escrowService.releaseEscrow(
      orderId,
      req.user.id,
      transferProof,
      transferNote
    );
    
    await orderHistoryService.addOrderHistory(
      orderId,
      'COMPLETED',
      `Dana dicairkan: Rp${escrow.netAmount.toLocaleString()}`,
      req.user.id,
      'ADMIN',
      transferNote || 'Pencairan dana'
    );
    
    await createNotification(
      order.userId,
      'PAYMENT',
      '💰 Dana Dicairkan',
      `Dana untuk pesanan #${orderId} telah dicairkan ke rekening Anda.`,
      { orderId, amount: escrow.netAmount }
    );
    
    success(res, 'Dana berhasil dicairkan', escrow);
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ORDER HISTORY (TRACKING DETAIL)
// ============================================
const getOrderHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!order) {
      return notFound(res, 'Pesanan tidak ditemukan');
    }
    
    const isOwner = order.userId === userId;
    const isSeller = await prisma.product.findFirst({
      where: {
        sellerId: userId,
        orderItems: {
          some: { orderId: parseInt(id) }
        }
      }
    });
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isSeller && !isAdmin) {
      return forbidden(res, 'Anda tidak memiliki akses');
    }
    
    const history = await orderHistoryService.getOrderHistory(id);
    
    success(res, 'Riwayat pesanan', history);
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
    
    await orderHistoryService.addOrderHistory(
      id,
      status,
      `Status diubah ke ${status} oleh admin`,
      req.user.id,
      'ADMIN'
    );
    
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
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
          shipping: true,
          history: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
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
    console.error('Error fetching seller orders:', error);
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