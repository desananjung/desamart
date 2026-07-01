const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');
const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

// Routes
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetail);
router.post('/', authorize('BUYER', 'ADMIN'), orderController.createOrder);

// Payment route - pastikan controller ada
router.put('/:orderId/payment', authorize('BUYER', 'ADMIN'), orderController.processPayment);

// Admin only
router.put('/:id/status', authorize('ADMIN'), orderController.updateStatus);

module.exports = router;