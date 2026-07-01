const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound } = require('../utils/responseHelper');

// Import services yang sudah ada
const registrationService = require('../services/cooperative/registrationService');
const memberService = require('../services/cooperative/memberService');
const loanService = require('../services/cooperative/loanService');
const shuService = require('../services/cooperative/shuService');

const router = express.Router();

// Semua route koperasi memerlukan autentikasi
router.use(authenticate);

// ========== REGISTRATION ==========
router.post('/register', authorize('ADMIN'), async (req, res, next) => {
  try {
    const cooperative = await registrationService.registerCooperative(req.user.id, req.body);
    success(res, 'Koperasi berhasil didaftarkan', cooperative);
  } catch (error) {
    next(error);
  }
});

router.get('/status', async (req, res, next) => {
  try {
    const status = await registrationService.getCooperativeStatus(req.user.id);
    success(res, 'Status koperasi', status);
  } catch (error) {
    next(error);
  }
});

// ========== MEMBERS ==========
router.post('/members', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { cooperativeId, userId, role } = req.body;
    if (!cooperativeId || !userId) {
      return badRequest(res, 'Cooperative ID dan User ID wajib diisi');
    }
    const member = await memberService.addMember(cooperativeId, userId, role);
    success(res, 'Anggota berhasil ditambahkan', member);
  } catch (error) {
    next(error);
  }
});

router.get('/members', async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    if (!cooperativeId) {
      return badRequest(res, 'Cooperative ID wajib diisi');
    }
    const members = await memberService.getMembers(parseInt(cooperativeId));
    success(res, 'Daftar anggota', members);
  } catch (error) {
    next(error);
  }
});

router.get('/members/:memberId/stats', async (req, res, next) => {
  try {
    const stats = await memberService.getMemberStats(parseInt(req.params.memberId));
    success(res, 'Statistik anggota', stats);
  } catch (error) {
    next(error);
  }
});

// ========== LOANS ==========
router.post('/loans/request', async (req, res, next) => {
  try {
    const { memberId, amount, tenure, interestRate, purpose } = req.body;
    if (!memberId || !amount || !tenure) {
      return badRequest(res, 'Member ID, amount, dan tenure wajib diisi');
    }
    const loan = await loanService.requestLoan(memberId, { amount, tenure, interestRate, purpose });
    success(res, 'Pengajuan pinjaman berhasil', loan);
  } catch (error) {
    next(error);
  }
});

router.put('/loans/:loanId/approve', authorize('ADMIN'), async (req, res, next) => {
  try {
    const loan = await loanService.approveLoan(parseInt(req.params.loanId));
    success(res, 'Pinjaman disetujui', loan);
  } catch (error) {
    next(error);
  }
});

router.put('/loans/:loanId/disburse', authorize('ADMIN'), async (req, res, next) => {
  try {
    const loan = await loanService.disburseLoan(parseInt(req.params.loanId));
    success(res, 'Pinjaman dicairkan', loan);
  } catch (error) {
    next(error);
  }
});

router.post('/loans/:loanId/pay', async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return badRequest(res, 'Amount wajib diisi');
    }
    const payment = await loanService.makePayment(parseInt(req.params.loanId), amount);
    success(res, 'Pembayaran berhasil', payment);
  } catch (error) {
    next(error);
  }
});

router.get('/loans', async (req, res, next) => {
  try {
    const { cooperativeId, status } = req.query;
    if (!cooperativeId) {
      return badRequest(res, 'Cooperative ID wajib diisi');
    }
    const loans = await loanService.getLoans(parseInt(cooperativeId), status);
    success(res, 'Daftar pinjaman', loans);
  } catch (error) {
    next(error);
  }
});

// ========== SHU ==========
router.get('/shu/calculate', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { cooperativeId, year } = req.query;
    if (!cooperativeId || !year) {
      return badRequest(res, 'Cooperative ID dan year wajib diisi');
    }
    const result = await shuService.calculateSHU(parseInt(cooperativeId), parseInt(year));
    success(res, 'Perhitungan SHU', result);
  } catch (error) {
    next(error);
  }
});

router.post('/shu/distribute', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { cooperativeId, year } = req.body;
    if (!cooperativeId || !year) {
      return badRequest(res, 'Cooperative ID dan year wajib diisi');
    }
    const result = await shuService.distributeSHU(parseInt(cooperativeId), parseInt(year));
    success(res, 'SHU berhasil dibagikan', result);
  } catch (error) {
    next(error);
  }
});

// ========== DASHBOARD ==========
router.get('/dashboard', async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    if (!cooperativeId) {
      return badRequest(res, 'Cooperative ID wajib diisi');
    }

    const [members, loans, savings, stats] = await Promise.all([
      memberService.getMembers(parseInt(cooperativeId)),
      loanService.getLoans(parseInt(cooperativeId)),
      // Get savings summary
      loanService.getLoans(parseInt(cooperativeId), 'ACTIVE'),
      registrationService.getCooperativeStatus(req.user.id)
    ]);

    const dashboard = {
      totalMembers: members.length,
      activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
      totalSavings: 0, // Hitung dari savings
      totalRevenue: 0, // Hitung dari transaksi
      recentMembers: members.slice(0, 5),
      recentLoans: loans.slice(0, 5)
    };

    success(res, 'Dashboard koperasi', dashboard);
  } catch (error) {
    next(error);
  }
});

module.exports = router;