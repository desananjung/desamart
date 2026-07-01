const wishlistService = require('../services/wishlistService');
const reviewService = require('../services/reviewService');
const { success, created, badRequest, notFound } = require('../utils/responseHelper');

// ========== WISHLIST ==========
exports.getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    success(res, 'Wishlist berhasil diambil', items);
  } catch (error) {
    console.error('Error in getWishlist:', error);
    next(error);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return badRequest(res, 'Product ID wajib diisi');
    }
    const result = await wishlistService.toggleWishlist(req.user.id, productId);
    success(res, result.message, result);
  } catch (error) {
    console.error('Error in toggleWishlist:', error);
    next(error);
  }
};

exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return badRequest(res, 'Product ID wajib diisi');
    }
    const isInWishlist = await wishlistService.checkWishlist(req.user.id, productId);
    success(res, 'Status wishlist', { isInWishlist });
  } catch (error) {
    console.error('Error in checkWishlist:', error);
    next(error);
  }
};

// ========== REVIEWS ==========
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return badRequest(res, 'Product ID wajib diisi');
    }
    const reviews = await reviewService.getProductReviews(productId);
    success(res, 'Daftar review berhasil diambil', reviews);
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    
    if (!productId) {
      return badRequest(res, 'Product ID wajib diisi');
    }
    if (!orderId) {
      return badRequest(res, 'Order ID wajib diisi');
    }
    if (!rating) {
      return badRequest(res, 'Rating wajib diisi');
    }
    if (rating < 1 || rating > 5) {
      return badRequest(res, 'Rating harus antara 1-5');
    }

    const review = await reviewService.createReview(
      req.user.id,
      productId,
      orderId,
      rating,
      comment
    );
    created(res, 'Review berhasil ditambahkan', review);
  } catch (error) {
    console.error('Error in createReview:', error);
    if (error.message.includes('belum membeli')) {
      return badRequest(res, error.message);
    }
    if (error.message.includes('sudah memberikan review')) {
      return badRequest(res, error.message);
    }
    next(error);
  }
};