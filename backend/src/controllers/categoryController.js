const categoryService = require('../services/categoryService');
const { success, created, badRequest, notFound, conflict } = require('../utils/responseHelper');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    success(res, 'Daftar kategori', categories);
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const category = await categoryService.getById(parseInt(req.params.id));
    success(res, 'Detail kategori', category);
  } catch (error) { 
    if (error.message === 'Kategori tidak ditemukan') return notFound(res, error.message);
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return badRequest(res, 'Nama kategori wajib diisi');
    const category = await categoryService.create(name);
    created(res, 'Kategori berhasil dibuat', category);
  } catch (error) {
    if (error.message === 'Kategori dengan nama tersebut sudah ada') return conflict(res, error.message);
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return badRequest(res, 'Nama kategori wajib diisi');
    const category = await categoryService.update(parseInt(req.params.id), name);
    success(res, 'Kategori berhasil diperbarui', category);
  } catch (error) {
    if (error.message === 'Kategori tidak ditemukan') return notFound(res, error.message);
    if (error.message === 'Kategori dengan nama tersebut sudah ada') return conflict(res, error.message);
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await categoryService.remove(parseInt(req.params.id));
    success(res, 'Kategori berhasil dihapus');
  } catch (error) {
    if (error.message === 'Kategori tidak ditemukan') return notFound(res, error.message);
    if (error.message.includes('masih digunakan')) return conflict(res, error.message);
    next(error);
  }
};