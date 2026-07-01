const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const shippingController = require('../controllers/shippingController');

const router = express.Router();

// Public
router.get('/provinces', shippingController.getProvinces);
router.get('/cities/:provinceId', shippingController.getCities);
router.post('/calculate', shippingController.calculateShipping);

// Admin/Seller only
router.put('/order/:orderId', authenticate, authorize('ADMIN', 'SELLER'), shippingController.updateShipping);
router.get('/track/:trackingNumber/:courier', shippingController.trackShipment);

module.exports = router;