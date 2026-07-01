const recommendationService = require('../services/ai/recommendationService');
const searchService = require('../services/ai/searchService');
const chatbotService = require('../services/ai/chatbotService');
const { success, badRequest } = require('../utils/responseHelper');

// ========== RECOMMENDATIONS ==========
exports.getRecommendations = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      req.user.id,
      parseInt(limit)
    );
    success(res, 'Rekomendasi produk untuk Anda', recommendations);
  } catch (error) {
    next(error);
  }
};

exports.getSimilarProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;
    const similar = await recommendationService.getSimilarProducts(
      parseInt(productId),
      parseInt(limit)
    );
    success(res, 'Produk serupa', similar);
  } catch (error) {
    next(error);
  }
};

exports.getFrequentlyBoughtTogether = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;
    const products = await recommendationService.getFrequentlyBoughtTogether(
      parseInt(productId),
      parseInt(limit)
    );
    success(res, 'Produk yang sering dibeli bersama', products);
  } catch (error) {
    next(error);
  }
};

exports.getPopularProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const popular = await recommendationService.getPopularProducts(parseInt(limit));
    success(res, 'Produk populer', popular);
  } catch (error) {
    next(error);
  }
};

// ========== SMART SEARCH ==========
exports.smartSearch = async (req, res, next) => {
  try {
    const { q, categoryId, minPrice, maxPrice, limit = 20 } = req.query;
    if (!q) return badRequest(res, 'Query pencarian wajib diisi');
    
    const filters = { categoryId, minPrice, maxPrice };
    const results = await searchService.smartSearch(q, filters, parseInt(limit));
    success(res, 'Hasil pencarian', results);
  } catch (error) {
    next(error);
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return badRequest(res, 'Query wajib diisi');
    
    const suggestions = await searchService.getSuggestions(q, parseInt(limit));
    success(res, 'Saran pencarian', suggestions);
  } catch (error) {
    next(error);
  }
};

// ========== CHATBOT ==========
exports.chatbot = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return badRequest(res, 'Pesan wajib diisi');
    
    const response = await chatbotService.processMessage(req.user.id, message);
    success(res, 'Response chatbot', response);
  } catch (error) {
    next(error);
  }
};

// ========== PRICE PREDICTION ==========
exports.predictPrice = async (req, res, next) => {
  try {
    const { productId } = req.params;
    // Implementasi prediksi harga berdasarkan data historis
    // Untuk sekarang, return harga dengan sedikit kenaikan
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });
    
    if (!product) return badRequest(res, 'Produk tidak ditemukan');
    
    // Simulasi prediksi harga naik 5-10%
    const predictedPrice = product.price * (1 + (Math.random() * 0.05 + 0.05));
    
    success(res, 'Prediksi harga', {
      currentPrice: product.price,
      predictedPrice: Math.round(predictedPrice / 1000) * 1000,
      confidence: 0.85
    });
  } catch (error) {
    next(error);
  }
};