// backend/src/utils/notificationHelper.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// CREATE NOTIFICATION
// ============================================
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        type,
        title,
        message,
        data
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// ============================================
// NOTIFICATION TYPES
// ============================================
const NOTIFICATION_TYPES = {
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  SHIPPING: 'SHIPPING',
  SELLER: 'SELLER',
  SYSTEM: 'SYSTEM',
  PROMO: 'PROMO',
  ESCROW: 'ESCROW',      // ← TAMBAHKAN DENGAN KOMA
  RELEASE: 'RELEASE',    // ← TAMBAHKAN DENGAN KOMA
  COD: 'COD'             // ← TAMBAHKAN
};

// ============================================
// BUYER NOTIFICATIONS
// ============================================
const notifyOrderCreated = async (buyerId, order) => {
  return await createNotification(
    buyerId,
    NOTIFICATION_TYPES.ORDER,
    '📦 Pesanan Dibuat',
    `Pesanan #${order.id} berhasil dibuat. Silakan selesaikan pembayaran.`,
    { orderId: order.id }
  );
};

const notifyPaymentSuccess = async (buyerId, order) => {
  return await createNotification(
    buyerId,
    NOTIFICATION_TYPES.PAYMENT,
    '✅ Pembayaran Berhasil',
    `Pembayaran untuk pesanan #${order.id} telah dikonfirmasi.`,
    { orderId: order.id }
  );
};

const notifyOrderShipped = async (buyerId, order) => {
  return await createNotification(
    buyerId,
    NOTIFICATION_TYPES.SHIPPING,
    '🚚 Pesanan Dikirim',
    `Pesanan #${order.id} sedang dalam perjalanan.`,
    { orderId: order.id }
  );
};

const notifyOrderDelivered = async (buyerId, order) => {
  return await createNotification(
    buyerId,
    NOTIFICATION_TYPES.ORDER,
    '🎉 Pesanan Selesai',
    `Pesanan #${order.id} telah sampai. Jangan lupa beri ulasan!`,
    { orderId: order.id }
  );
};

// ============================================
// SELLER NOTIFICATIONS
// ============================================
const notifyNewOrder = async (sellerId, order, productName) => {
  return await createNotification(
    sellerId,
    NOTIFICATION_TYPES.SELLER,
    '🛒 Pesanan Baru',
    `Ada pesanan baru untuk produk "${productName}". Segera proses!`,
    { orderId: order.id, productName }
  );
};

const notifyProductSold = async (sellerId, order, productName) => {
  return await createNotification(
    sellerId,
    NOTIFICATION_TYPES.SELLER,
    '📈 Produk Terjual',
    `"${productName}" telah terjual!`,
    { orderId: order.id, productName }
  );
};

// ============================================
// ESCROW NOTIFICATIONS
// ============================================
const notifyEscrowHeld = async (sellerId, order) => {
  return await createNotification(
    sellerId,
    NOTIFICATION_TYPES.ESCROW,
    '💰 Dana Ditahan',
    `Dana untuk pesanan #${order.id} sedang ditahan di escrow.`,
    { orderId: order.id }
  );
};

const notifyEscrowReleased = async (sellerId, order) => {
  return await createNotification(
    sellerId,
    NOTIFICATION_TYPES.RELEASE,
    '💳 Dana Dicairkan',
    `Dana untuk pesanan #${order.id} telah dicairkan ke rekening Anda.`,
    { orderId: order.id }
  );
};

const notifyCODReceived = async (adminId, order) => {
  return await createNotification(
    adminId,
    NOTIFICATION_TYPES.COD,
    '💰 COD Dibayar',
    `Kurir telah menerima pembayaran COD untuk pesanan #${order.id}.`,
    { orderId: order.id }
  );
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  NOTIFICATION_TYPES,
  createNotification,
  notifyOrderCreated,
  notifyPaymentSuccess,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyNewOrder,
  notifyProductSold,
  notifyEscrowHeld,
  notifyEscrowReleased,
  notifyCODReceived
};