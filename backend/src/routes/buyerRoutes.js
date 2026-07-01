const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const buyerController = require('../controllers/buyerController');
const { success } = require('../utils/responseHelper');

const router = express.Router();

// Semua route buyer memerlukan autentikasi
router.use(authenticate);
router.use(authorize('BUYER', 'ADMIN'));

// Dashboard
router.get('/dashboard', (req, res) => {
  success(res, 'Buyer dashboard', { 
    user: req.user,
    message: 'Selamat datang di dashboard pembeli!'
  });
});

// Wishlist
router.get('/wishlist', buyerController.getWishlist);
router.post('/wishlist/toggle', buyerController.toggleWishlist);
router.get('/wishlist/check/:productId', buyerController.checkWishlist);

// Reviews
router.get('/reviews/product/:productId', buyerController.getProductReviews);
router.post('/reviews', buyerController.createReview);

module.exports = router;