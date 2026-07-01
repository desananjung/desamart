const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cartController');
const router = express.Router();

// Semua route cart memerlukan autentikasi
router.use(authenticate);

// Buyer dan Admin bisa mengakses cart
router.get('/', authorize('BUYER', 'ADMIN'), cartController.getCart);
router.post('/items', authorize('BUYER', 'ADMIN'), cartController.addItem);
router.put('/items/:itemId', authorize('BUYER', 'ADMIN'), cartController.updateItem);
router.delete('/items/:itemId', authorize('BUYER', 'ADMIN'), cartController.removeItem);
router.delete('/clear', authorize('BUYER', 'ADMIN'), cartController.clearCart);

module.exports = router;