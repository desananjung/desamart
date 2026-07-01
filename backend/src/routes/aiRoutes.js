const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

const router = express.Router();

// Semua route AI memerlukan autentikasi
router.use(authenticate);

// Recommendations
router.get('/recommendations', aiController.getRecommendations);
router.get('/similar/:productId', aiController.getSimilarProducts);
router.get('/frequently-bought/:productId', aiController.getFrequentlyBoughtTogether);
router.get('/popular', aiController.getPopularProducts);

// Smart Search
router.get('/search', aiController.smartSearch);
router.get('/suggestions', aiController.getSuggestions);

// Chatbot
router.post('/chatbot', aiController.chatbot);

// Price Prediction
router.get('/predict-price/:productId', aiController.predictPrice);

module.exports = router;