const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const storeController = require('../controllers/storeController');
const productController = require('../controllers/productController');
const { success } = require('../utils/responseHelper');

const router = express.Router();

// Semua route seller memerlukan autentikasi dan role SELLER atau ADMIN
router.use(authenticate, authorize('SELLER', 'ADMIN'));

// Dashboard & Store
router.get('/dashboard', (req, res) => {
  success(res, 'Seller dashboard', { user: req.user });
});

router.get('/store', storeController.getStore);
router.put('/store', storeController.updateStore);
router.get('/stats', storeController.getStats);

// Orders
router.get('/orders', storeController.getOrders);
router.put('/orders/:id/status', storeController.updateOrderStatus);

// Products (sudah ada di productRoutes, tapi kita tambahkan untuk seller specific)
router.get('/products', async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      include: {
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Produk seller', products);
  } catch (error) {
    next(error);
  }
});

module.exports = router;