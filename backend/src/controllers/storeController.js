const storeService = require('../services/storeService');
const { success, badRequest, notFound } = require('../utils/responseHelper');

exports.getStore = async (req, res, next) => {
  try {
    const store = await storeService.getStoreBySeller(req.user.id);
    success(res, 'Data toko', store);
  } catch (error) {
    next(error);
  }
};

exports.updateStore = async (req, res, next) => {
  try {
    const store = await storeService.updateStore(req.user.id, req.body);
    success(res, 'Toko berhasil diperbarui', store);
  } catch (error) {
    if (error.message === 'Toko tidak ditemukan') return notFound(res, error.message);
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await storeService.getStoreStats(req.user.id);
    success(res, 'Statistik toko', stats);
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const orders = await storeService.getSellerOrders(req.user.id, status);
    success(res, 'Daftar pesanan', orders);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return badRequest(res, 'Status wajib diisi');
    
    const order = await storeService.updateOrderStatus(parseInt(id), status, req.user.id);
    success(res, 'Status pesanan diperbarui', order);
  } catch (error) {
    if (error.message === 'Pesanan tidak ditemukan') return notFound(res, error.message);
    if (error.message === 'Anda tidak memiliki akses ke pesanan ini') return badRequest(res, error.message);
    if (error.message === 'Status tidak valid') return badRequest(res, error.message);
    next(error);
  }
};