const umkmService = require('../services/umkm/umkmService');
const postService = require('../services/umkm/postService');
const { success, created, badRequest, notFound, forbidden } = require('../utils/responseHelper');

// ========== UMKM CRUD ==========
exports.registerUMKM = async (req, res, next) => {
  try {
    const data = req.body;
    const umkm = await umkmService.registerUMKM(req.user.id, data);
    created(res, 'UMKM berhasil didaftarkan! Menunggu verifikasi admin.', umkm);
  } catch (error) {
    if (error.message.includes('sudah memiliki UMKM')) {
      return badRequest(res, error.message);
    }
    if (error.message.includes('sudah digunakan')) {
      return badRequest(res, error.message);
    }
    next(error);
  }
};

exports.getMyUMKM = async (req, res, next) => {
  try {
    const umkm = await umkmService.getUMKMByUserId(req.user.id);
    if (!umkm) {
      return notFound(res, 'Anda belum mendaftarkan UMKM');
    }
    success(res, 'Data UMKM', umkm);
  } catch (error) {
    next(error);
  }
};

exports.getUMKMBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const umkm = await umkmService.getUMKMBySlug(slug);
    success(res, 'Data UMKM', umkm);
  } catch (error) {
    if (error.message === 'UMKM tidak ditemukan') {
      return notFound(res, error.message);
    }
    next(error);
  }
};

exports.updateUMKM = async (req, res, next) => {
  try {
    const umkm = await umkmService.updateUMKM(req.user.id, req.body);
    success(res, 'UMKM berhasil diperbarui', umkm);
  } catch (error) {
    if (error.message === 'UMKM tidak ditemukan') {
      return notFound(res, error.message);
    }
    next(error);
  }
};

exports.searchUMKM = async (req, res, next) => {
  try {
    const { q, category, type, city, limit = 20 } = req.query;
    const filters = { category, type, city };
    const results = await umkmService.searchUMKM(q, filters, parseInt(limit));
    success(res, 'Hasil pencarian UMKM', results);
  } catch (error) {
    next(error);
  }
};

// ========== UMKM MEMBERS ==========
exports.addMember = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const umkm = await umkmService.getUMKMByUserId(req.user.id);
    if (!umkm) {
      return notFound(res, 'Anda belum memiliki UMKM');
    }
    const member = await umkmService.addMember(umkm.id, parseInt(userId), role);
    created(res, 'Member berhasil ditambahkan', member);
  } catch (error) {
    if (error.message.includes('sudah menjadi member')) {
      return badRequest(res, error.message);
    }
    next(error);
  }
};

// ========== CERTIFICATIONS ==========
exports.addCertification = async (req, res, next) => {
  try {
    const umkm = await umkmService.getUMKMByUserId(req.user.id);
    if (!umkm) {
      return notFound(res, 'Anda belum memiliki UMKM');
    }
    const cert = await umkmService.addCertification(umkm.id, req.body);
    created(res, 'Sertifikasi berhasil ditambahkan', cert);
  } catch (error) {
    next(error);
  }
};

// ========== POSTS ==========
exports.createPost = async (req, res, next) => {
  try {
    const umkm = await umkmService.getUMKMByUserId(req.user.id);
    if (!umkm) {
      return notFound(res, 'Anda belum memiliki UMKM');
    }
    const post = await postService.createPost(umkm.id, req.user.id, req.body);
    created(res, 'Post berhasil dibuat', post);
  } catch (error) {
    if (error.message.includes('bukan member')) {
      return forbidden(res, error.message);
    }
    next(error);
  }
};

exports.getUMKMPosts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const umkm = await umkmService.getUMKMBySlug(slug);
    const posts = await postService.getPosts(umkm.id);
    success(res, 'Daftar post UMKM', posts);
  } catch (error) {
    next(error);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const feed = await postService.getFeed(parseInt(limit));
    success(res, 'Feed UMKM', feed);
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await postService.toggleLike(parseInt(postId), req.user.id);
    success(res, 'Like berhasil', post);
  } catch (error) {
    if (error.message === 'Post tidak ditemukan') {
      return notFound(res, error.message);
    }
    next(error);
  }
};

// ========== ADMIN ==========
exports.verifyUMKM = async (req, res, next) => {
  try {
    const { umkmId } = req.params;
    const { status } = req.body;
    const umkm = await umkmService.verifyUMKM(parseInt(umkmId), req.user.id, status);
    success(res, `UMKM berhasil ${status === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`, umkm);
  } catch (error) {
    next(error);
  }
};