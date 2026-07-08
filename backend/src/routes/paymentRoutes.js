// backend/src/routes/paymentRoutes.js
const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const paymentService = require('../services/paymentService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotification } = require('../utils/notificationHelper');

const router = express.Router();

router.use(authenticate);

// ============================================
// GET PAYMENT METHODS
// ============================================
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

// ============================================
// GET BANK ACCOUNTS
// ============================================
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

// ============================================
// PROCESS PAYMENT
// ============================================
router.post('/process/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { method, bankAccountId } = req.body;
    
    console.log('💰 Processing payment:', { 
      orderId, 
      method, 
      bankAccountId, 
      userId: req.user.id,
      userRole: req.user.role 
    });

    if (!method) {
      return badRequest(res, 'Metode pembayaran wajib dipilih');
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: {
              select: { 
                name: true, 
                imageUrl: true,
                sellerId: true 
              }
            }
          }
        }
      }
    });

    if (!order) {
      return badRequest(res, 'Pesanan tidak ditemukan');
    }

    console.log('✅ Order found:', order.id);
    console.log('📦 Order status:', order.status);
    console.log('💰 Order total:', order.total);

    if (order.userId !== req.user.id) {
      return badRequest(res, 'Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== 'PENDING') {
      return badRequest(res, 'Pesanan sudah diproses');
    }

    // Update order
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
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                sellerId: true
              }
            }
          }
        },
        // ✅ PERBAIKI: Ganti user menjadi User
        User: {
          select: {
            name: true,
            email: true,
            // phone: true //
          }
        }
      }
    });

    console.log('✅ Order updated:', updatedOrder.id);

    // Create payment record
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

    // Notifikasi ke seller
    for (const item of order.items) {
      if (item.product?.sellerId) {
        await createNotification(
          item.product.sellerId,
          'PAYMENT',
          '💰 Pembayaran Masuk',
          `Pembayaran untuk pesanan #${orderId} telah masuk.`,
          { orderId: orderId }
        );
      }
    }

    success(res, 'Pembayaran berhasil', updatedOrder);
  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Gagal memproses pembayaran',
      errors: error.errors || null,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// UPLOAD BUKTI TRANSFER
// ============================================
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
          include: {
            product: {
              select: { 
                name: true,
                sellerId: true
              }
            }
          }
        },
        // ✅ PERBAIKI: Ganti user menjadi User
        User: {
          select: {
            name: true,
            email: true,
            //phone: true //
          }
        }
      }
    });

    console.log('✅ Proof uploaded for order:', updatedOrder.id);

    // Notifikasi ke admin
    await createNotification(
      1, // Admin ID
      'PAYMENT',
      '💳 Bukti Transfer Baru',
      `Ada bukti transfer baru untuk pesanan #${orderId}`,
      { orderId, proofImage }
    );

    success(res, 'Bukti transfer berhasil diupload', updatedOrder);
  } catch (error) {
    console.error('Upload proof error:', error);
    next(error);
  }
});

// ============================================
// CONFIRM PAYMENT (Admin/Seller)
// ============================================
router.put('/confirm/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: {
              select: { 
                sellerId: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return badRequest(res, 'Pesanan tidak ditemukan');
    }

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
          include: {
            product: {
              select: { 
                name: true,
                sellerId: true
              }
            }
          }
        },
        // ✅ PERBAIKI: Ganti user menjadi User
        User: {
          select: {
            name: true,
            email: true,
            // phone: true
          }
        }
      }
    });

    // Notifikasi ke buyer
    await createNotification(
      order.userId,
      'PAYMENT',
      '✅ Pembayaran Dikonfirmasi',
      `Pembayaran untuk pesanan #${orderId} telah dikonfirmasi.`,
      { orderId }
    );

    success(res, 'Pembayaran dikonfirmasi', updatedOrder);
  } catch (error) {
    console.error('Confirm payment error:', error);
    next(error);
  }
});

// ============================================
// TEST ENDPOINT
// ============================================
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment routes working!', user: req.user });
});

module.exports = router;