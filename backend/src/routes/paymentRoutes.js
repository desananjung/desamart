const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const paymentService = require('../services/paymentService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // ← TAMBAHKAN INI

const router = express.Router();

router.use(authenticate);

// Get all payment methods
router.get('/methods', async (req, res, next) => {
  try {
    console.log('✅ GET /methods called');
    
    let methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      include: {
        bankAccounts: {
          where: { isActive: true }
        }
      }
    });

    if (methods.length === 0) {
      methods = [
        { 
          id: 1, 
          code: 'bank_transfer', 
          name: 'BANK_TRANSFER', 
          description: 'Transfer Bank',
          bankAccounts: [
            { id: 1, bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DesaMart Official' },
            { id: 2, bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'DesaMart Official' },
            { id: 3, bankName: 'BNI', accountNumber: '5678901234', accountHolder: 'DesaMart Official' }
          ]
        },
        { id: 2, code: 'qris', name: 'QRIS', description: 'QR Code Payment', bankAccounts: [] },
        { id: 3, code: 'cod', name: 'COD', description: 'Cash on Delivery', bankAccounts: [] }
      ];
    }

    success(res, 'Metode pembayaran', methods);
  } catch (error) {
    console.error('Error in /methods:', error);
    success(res, 'Metode pembayaran', [
      { id: 1, code: 'bank_transfer', name: 'BANK_TRANSFER', description: 'Transfer Bank' },
      { id: 2, code: 'qris', name: 'QRIS', description: 'QR Code Payment' },
      { id: 3, code: 'cod', name: 'COD', description: 'Cash on Delivery' }
    ]);
  }
});

// Get bank accounts
router.get('/banks', async (req, res, next) => {
  try {
    console.log('✅ GET /banks called');
    
    let banks = await prisma.bankAccount.findMany({
      where: { isActive: true }
    });

    if (banks.length === 0) {
      banks = [
        { id: 1, bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DesaMart Official' },
        { id: 2, bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'DesaMart Official' },
        { id: 3, bankName: 'BNI', accountNumber: '5678901234', accountHolder: 'DesaMart Official' }
      ];
    }

    success(res, 'Daftar bank', banks);
  } catch (error) {
    console.error('Error in /banks:', error);
    success(res, 'Daftar bank', [
      { id: 1, bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DesaMart Official' },
      { id: 2, bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'DesaMart Official' },
      { id: 3, bankName: 'BNI', accountNumber: '5678901234', accountHolder: 'DesaMart Official' }
    ]);
  }
});

// Process payment
router.post('/process/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { method, bankAccountId } = req.body;
    
    console.log('💰 Processing payment:', { orderId, method, bankAccountId, userId: req.user.id });

    if (!method) {
      return badRequest(res, 'Metode pembayaran wajib dipilih');
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      return badRequest(res, 'Pesanan tidak ditemukan');
    }

    if (order.userId !== req.user.id) {
      return badRequest(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== 'PENDING') {
      return badRequest(res, 'Pesanan sudah diproses');
    }

    console.log('✅ Order found:', order.id);

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentMethod: method,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        status: 'PROCESSING'
      },
      include: {
        items: {
          include: { product: { select: { name: true, imageUrl: true } } }
        },
        user: { select: { name: true, email: true } }
      }
    });

    console.log('✅ Order updated:', updatedOrder.id);

    await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        userId: req.user.id,
        method: method,
        amount: order.total,
        status: 'PAID',
        paidAt: new Date()
      }
    });

    console.log('✅ Payment recorded');

    success(res, 'Pembayaran berhasil', updatedOrder);
  } catch (error) {
    console.error('❌ Payment error:', error);
    next(error);
  }
});

// Upload bukti transfer
router.post('/upload-proof/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { proofImage } = req.body;

    console.log('📤 Upload proof:', { orderId, proofImage, userId: req.user.id });

    if (!proofImage) {
      return badRequest(res, 'Bukti pembayaran wajib diupload');
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      return badRequest(res, 'Pesanan tidak ditemukan');
    }

    if (order.userId !== req.user.id) {
      return badRequest(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    // Cek status - bisa PENDING atau PAID
    if (order.paymentStatus !== 'PENDING' && order.paymentStatus !== 'PAID') {
      return badRequest(res, 'Pesanan sudah dikonfirmasi');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentProof: proofImage,
        paymentStatus: 'WAITING_CONFIRMATION'
      },
      include: {
        items: {
          include: { product: { select: { name: true } } }
        },
        user: { select: { name: true, email: true } }
      }
    });

    console.log('✅ Proof uploaded for order:', updatedOrder.id);

    success(res, 'Bukti transfer berhasil diupload', updatedOrder);
  } catch (error) {
    console.error('Upload proof error:', error);
    next(error);
  }
});
// Confirm payment (untuk seller/admin)
router.put('/confirm/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    // Cek apakah user adalah seller atau admin
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: {
              select: { sellerId: true }
            }
          }
        }
      }
    });

    if (!order) {
      return badRequest(res, 'Pesanan tidak ditemukan');
    }

    // Cek apakah user adalah seller dari produk ini atau admin
    const isSeller = order.items.some(item => item.product.sellerId === req.user.id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSeller && !isAdmin) {
      return badRequest(res, 'Anda tidak memiliki akses untuk mengkonfirmasi pembayaran ini');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: 'CONFIRMED',
        status: 'PROCESSING'
      },
      include: {
        items: {
          include: { product: { select: { name: true } } }
        },
        user: { select: { name: true, email: true } }
      }
    });

    success(res, 'Pembayaran dikonfirmasi', updatedOrder);
  } catch (error) {
    console.error('Confirm payment error:', error);
    next(error);
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment routes working!', user: req.user });
});

module.exports = router;