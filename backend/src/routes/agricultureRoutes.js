const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest } = require('../utils/responseHelper');
const commodityService = require('../services/agriculture/commodityService');

const router = express.Router();

router.use(authenticate);

// ========== FARM ==========
router.post('/farm', async (req, res, next) => {
  try {
    const farm = await commodityService.registerFarm(req.user.id, req.body);
    success(res, 'Lahan berhasil didaftarkan', farm);
  } catch (error) { next(error); }
});

router.post('/commodity', async (req, res, next) => {
  try {
    const commodity = await commodityService.addCommodity(req.body.farmId, req.body);
    success(res, 'Komoditas berhasil ditambahkan', commodity);
  } catch (error) { next(error); }
});

router.post('/harvest', async (req, res, next) => {
  try {
    const harvest = await commodityService.recordHarvest(req.body);
    success(res, 'Hasil panen berhasil dicatat', harvest);
  } catch (error) { next(error); }
});

// ========== MARKET ==========
router.get('/prices', async (req, res, next) => {
  try {
    const { commodity } = req.query;
    const prices = await commodityService.getMarketPrices(commodity);
    success(res, 'Harga pasaran', prices);
  } catch (error) { next(error); }
});

router.get('/seasons', async (req, res, next) => {
  try {
    const { year } = req.query;
    const seasons = await commodityService.getSeasonInfo(year ? parseInt(year) : null);
    success(res, 'Informasi musim', seasons);
  } catch (error) { next(error); }
});

module.exports = router;