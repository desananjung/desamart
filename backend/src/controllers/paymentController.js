const paymentService = require('../services/paymentService');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');

exports.createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return badRequest(res, 'Order ID wajib diisi');
    
    const result = await paymentService.createPayment(orderId, req.user.id);
    success(res, 'Payment created successfully', result);
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) return notFound(res, error.message);
    if (error.message.includes('tidak memiliki akses')) return badRequest(res, error.message);
    if (error.message.includes('sudah dibayar')) return badRequest(res, error.message);
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const result = await paymentService.handlePaymentNotification(req.body);
    success(res, 'Payment notification processed', result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ status: 'ok' }); // Always return 200 to Midtrans
  }
};

exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await paymentService.checkPaymentStatus(orderId, req.user.id);
    success(res, 'Payment status', result);
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) return notFound(res, error.message);
    if (error.message.includes('tidak memiliki akses')) return badRequest(res, error.message);
    next(error);
  }
};