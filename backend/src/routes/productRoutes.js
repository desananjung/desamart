const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');
const router = express.Router();

// Semua pengguna yang login bisa melihat produk
router.get('/', authenticate, productController.getAll);
router.get('/:id', authenticate, productController.getById);

// Hanya seller atau admin yang bisa membuat, mengedit, menghapus
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), productController.create);
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), productController.update);
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), productController.remove);

module.exports = router;