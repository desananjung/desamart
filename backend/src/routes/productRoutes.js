const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');
const router = express.Router();

// ✅ PUBLIK - Semua orang bisa lihat produk
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// 🔒 Hanya seller/admin yang bisa create/update/delete
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), productController.create);
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), productController.update);
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), productController.remove);

module.exports = router;