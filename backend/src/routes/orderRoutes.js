// backend/src/routes/orderRoutes.js
const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');
const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

// ============================================
// BUYER ROUTES
// ============================================

// GET - Daftar pesanan user
router.get('/', orderController.getMyOrders);

// GET - Detail pesanan
router.get('/:id', orderController.getOrderDetail);

// GET - Riwayat pesanan (tracking)
router.get('/:id/history', orderController.getOrderHistory);

// POST - Buat pesanan baru (Buyer/Admin)
router.post('/', authorize('BUYER', 'ADMIN'), orderController.createOrder);

// POST - Upload bukti transfer
router.post('/:orderId/upload-proof', authorize('BUYER', 'ADMIN'), orderController.uploadPaymentProof);

// PUT - Konfirmasi barang diterima
router.put('/:id/confirm-received', authorize('BUYER', 'ADMIN'), orderController.confirmReceived);

// ============================================
// SELLER ROUTES
// ============================================

// GET - Daftar pesanan untuk seller
router.get('/seller/orders', authorize('SELLER', 'ADMIN'), orderController.getSellerOrders);

// PUT - Seller update status pesanan
router.put('/seller/:id/status', authorize('SELLER', 'ADMIN'), orderController.updateSellerOrderStatus);

// ============================================
// COURIER ROUTES
// ============================================

// PUT - Courier update status pengiriman
router.put('/courier/:id/status', authorize('ADMIN'), orderController.updateCourierStatus);

// ============================================
// ADMIN ROUTES
// ============================================

// PUT - Verifikasi pembayaran (Admin)
router.put('/:orderId/verify-payment', authorize('ADMIN'), orderController.verifyPayment);

// PUT - Cairkan dana escrow (Admin)
router.put('/:orderId/release-escrow', authorize('ADMIN'), orderController.releaseEscrow);

// PUT - Update status pesanan (Admin)
router.put('/admin/:id/status', authorize('ADMIN'), orderController.updateStatus);

// ============================================
// PAYMENT ROUTES
// ============================================

// PUT - Proses pembayaran
router.put('/:orderId/payment', authorize('BUYER', 'ADMIN'), orderController.processPayment);

module.exports = router;