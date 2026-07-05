const productService = require('../services/productService');
const { success, created, badRequest, notFound, conflict, forbidden } = require('../utils/responseHelper');

exports.getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const products = await productService.getAll(filters);
    success(res, 'Daftar produk', products);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await productService.getById(parseInt(req.params.id));
    success(res, 'Detail produk', product);
  } catch (error) {
    if (error.message === 'Produk tidak ditemukan') {
      return notFound(res, error.message);
    }
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    if (!name || !price || !categoryId) {
      return badRequest(res, 'Nama, harga, dan kategori wajib diisi');
    }
    const product = await productService.create(
      { name, description, price, stock, categoryId, imageUrl },
      req.user.id
    );
    created(res, 'Produk berhasil dibuat', product);
  } catch (error) {
    if (error.message === 'Nama produk sudah digunakan, gunakan nama lain') {
      return conflict(res, error.message);
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await productService.update(
      parseInt(req.params.id),
      req.body,
      req.user.id,
      req.user.role === 'ADMIN'
    );
    success(res, 'Produk berhasil diperbarui', product);
  } catch (error) {
    if (error.message === 'Produk tidak ditemukan') {
      return notFound(res, error.message);
    }
    if (error.message.includes('tidak memiliki akses')) {
      return forbidden(res, error.message);
    }
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await productService.remove(
      parseInt(req.params.id),
      req.user.id,
      req.user.role === 'ADMIN'
    );
    success(res, 'Produk berhasil dihapus');
  } catch (error) {
    if (error.message === 'Produk tidak ditemukan') {
      return notFound(res, error.message);
    }
    if (error.message.includes('tidak memiliki akses')) {
      return forbidden(res, error.message);
    }
    next(error);
  }
};