const cartService = require('../services/cartService');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user.id);
    success(res, 'Keranjang belanja', cart);
  } catch (error) { next(error); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return badRequest(res, 'ID produk wajib diisi');
    const item = await cartService.addItem(req.user.id, productId, quantity || 1);
    created(res, 'Item berhasil ditambahkan ke keranjang', item);
  } catch (error) {
    if (error.message === 'Produk tidak ditemukan') return notFound(res, error.message);
    if (error.message.includes('Stok')) return badRequest(res, error.message);
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) return badRequest(res, 'Quantity wajib diisi');
    const item = await cartService.updateItem(req.user.id, req.params.itemId, quantity);
    success(res, 'Item keranjang diperbarui', item);
  } catch (error) {
    if (error.message === 'Item tidak ditemukan') return notFound(res, error.message);
    if (error.message.includes('akses')) return forbidden(res, error.message);
    if (error.message.includes('Stok')) return badRequest(res, error.message);
    next(error);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    await cartService.removeItem(req.user.id, req.params.itemId);
    success(res, 'Item dihapus dari keranjang');
  } catch (error) {
    if (error.message === 'Item tidak ditemukan') return notFound(res, error.message);
    if (error.message.includes('akses')) return forbidden(res, error.message);
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    success(res, 'Keranjang berhasil dikosongkan');
  } catch (error) { next(error); }
};