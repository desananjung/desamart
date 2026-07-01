const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/create', authenticate, paymentController.createPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/status/:orderId', authenticate, paymentController.checkPaymentStatus);

module.exports = router;