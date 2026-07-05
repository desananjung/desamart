const orderService = require('../services/orderService');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // ← TAMBAHKAN INI

// ========== CREATE ORDER ==========
exports.createOrder = async (req, res, next) => {
  try {
    const { address, phone, note } = req.body;
    if (!address || !phone) {
      return badRequest(res, 'Alamat dan nomor telepon wajib diisi');
    }
    
    const order = await orderService.createOrder(req.user.id, address, phone, note);
    
    // Kirim notifikasi ke seller
    await sendOrderNotification(order);
    
    created(res, 'Pesanan berhasil dibuat', order);
  } catch (error) {
    if (error.message === 'Keranjang belanja kosong') return badRequest(res, error.message);
    if (error.message.includes('Stok')) return badRequest(res, error.message);
    next(error);
  }
};

// ========== GET MY ORDERS ==========
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.id);
    success(res, 'Daftar pesanan Anda', orders);
  } catch (error) {
    next(error);
  }
};

// ========== GET ORDER DETAIL ==========
exports.getOrderDetail = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(
      req.params.id,
      req.user.id,
      req.user.role === 'ADMIN'
    );
    success(res, 'Detail pesanan', order);
  } catch (error) {
    if (error.message === 'Pesanan tidak ditemukan') return notFound(res, error.message);
    if (error.message.includes('akses')) return forbidden(res, error.message);
    next(error);
  }
};

// ========== PROCESS PAYMENT ==========
exports.processPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, shippingMethod } = req.body;
    
    if (!paymentMethod) return badRequest(res, 'Metode pembayaran wajib dipilih');
    if (!shippingMethod) return badRequest(res, 'Metode pengiriman wajib dipilih');
    
    const order = await orderService.processPayment(
      parseInt(orderId),
      req.user.id,
      paymentMethod,
      shippingMethod
    );
    
    success(res, 'Pembayaran berhasil diproses', order);
  } catch (error) {
    console.error('Payment error:', error);
    if (error.message === 'Pesanan tidak ditemukan') return notFound(res, error.message);
    if (error.message.includes('akses')) return forbidden(res, error.message);
    if (error.message === 'Pesanan sudah diproses') return badRequest(res, error.message);
    next(error);
  }
};

// ========== UPDATE ORDER STATUS (ADMIN) ==========
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return badRequest(res, 'Status wajib diisi');
    
    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role === 'ADMIN'
    );
    success(res, 'Status pesanan diperbarui', order);
  } catch (error) {
    if (error.message === 'Pesanan tidak ditemukan') return notFound(res, error.message);
    if (error.message === 'Hanya admin yang dapat mengubah status') return forbidden(res, error.message);
    if (error.message === 'Status tidak valid') return badRequest(res, error.message);
    next(error);
  }
};

// ========== SEND NOTIFICATION TO SELLER ==========
async function sendOrderNotification(order) {
  try {
    // Ambil seller dari product
    const sellerIds = [];
    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { sellerId: true }
      });
      if (product && !sellerIds.includes(product.sellerId)) {
        sellerIds.push(product.sellerId);
      }
    }

    for (const sellerId of sellerIds) {
      // Simpan notifikasi ke database
      await prisma.notification.create({
        data: {
          userId: sellerId,
          type: 'NEW_ORDER',
          title: '📦 Pesanan Baru!',
          message: `Ada pesanan baru #${order.id} dari ${order.user?.name || 'Pembeli'}`,
          data: { orderId: order.id },
          isRead: false
        }
      });
      console.log(`✅ Notification sent to seller ${sellerId}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}