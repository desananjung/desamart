const enterpriseService = require('../services/enterpriseService');
const { success, created, badRequest, notFound, conflict, forbidden } = require('../utils/responseHelper');

exports.createEnterprise = async (req, res, next) => {
  try {
    const { name, description, type, address, phone, email, website, logo, banner } = req.body;
    
    if (!name || !address || !phone) {
      return badRequest(res, 'Nama, alamat, dan telepon wajib diisi');
    }

    const enterprise = await enterpriseService.createEnterprise(req.user.id, {
      name, description, type, address, phone, email, website, logo, banner
    });

    created(res, 'Enterprise berhasil dibuat', enterprise);
  } catch (error) {
    if (error.message === 'Anda sudah memiliki enterprise') return conflict(res, error.message);
    if (error.message === 'Nama enterprise sudah digunakan') return conflict(res, error.message);
    next(error);
  }
};

exports.getEnterprise = async (req, res, next) => {
  try {
    const enterprise = await enterpriseService.getEnterprise(req.user.id);
    if (!enterprise) {
      return success(res, 'Belum memiliki enterprise', null);
    }
    success(res, 'Data enterprise', enterprise);
  } catch (error) {
    next(error);
  }
};

exports.updateEnterprise = async (req, res, next) => {
  try {
    const enterprise = await enterpriseService.updateEnterprise(req.user.id, req.body);
    success(res, 'Enterprise berhasil diperbarui', enterprise);
  } catch (error) {
    if (error.message === 'Enterprise tidak ditemukan') return notFound(res, error.message);
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { userId, role, permissions } = req.body;
    const { enterpriseId } = req.params;

    if (!userId) return badRequest(res, 'User ID wajib diisi');

    const member = await enterpriseService.addMember(
      parseInt(enterpriseId),
      parseInt(userId),
      role,
      permissions
    );

    success(res, 'Anggota berhasil ditambahkan', member);
  } catch (error) {
    if (error.message === 'Enterprise tidak ditemukan') return notFound(res, error.message);
    if (error.message === 'User sudah menjadi anggota') return conflict(res, error.message);
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await enterpriseService.getStats(req.user.id);
    if (!stats) {
      return success(res, 'Belum memiliki enterprise', null);
    }
    success(res, 'Statistik enterprise', stats);
  } catch (error) {
    next(error);
  }
};