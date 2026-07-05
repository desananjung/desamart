const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound, conflict } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

// Import services
const registrationService = require('../services/cooperative/registrationService');
const memberService = require('../services/cooperative/memberService');
const loanService = require('../services/cooperative/loanService');
const shuService = require('../services/cooperative/shuService');

const router = express.Router();

// ============================================
// SEMUA ROUTE MEMERLUKAN AUTHENTIKASI
// ============================================
router.use(authenticate);

// ============================================
// REGISTER KOPERASI (Hanya ADMIN)
// ============================================
router.post('/register', authorize('ADMIN'), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    console.log('📝 Registering cooperative:', data);

    // Validasi
    if (!data.name) return badRequest(res, 'Nama koperasi wajib diisi');
    if (!data.registrationNumber) {
      return badRequest(res, 'Nomor registrasi wajib diisi');
    }
    if (!data.establishmentDate) {
      return badRequest(res, 'Tanggal pendirian wajib diisi');
    }
    if (!data.address) return badRequest(res, 'Alamat koperasi wajib diisi');

    // Cek user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) return badRequest(res, 'User tidak ditemukan');

    // Cek nama sudah digunakan
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await prisma.cooperativeDigital.findUnique({
      where: { slug }
    });
    if (existing) return conflict(res, 'Nama koperasi sudah digunakan');

    const cooperative = await prisma.cooperativeDigital.create({
      data: {
        name: data.name,
        slug,
        type: data.type || 'KUD',
        description: data.description || '',
        registrationNumber: data.registrationNumber,
        establishmentDate: new Date(data.establishmentDate),
        address: data.address,
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        certificateUrl: data.certificateUrl || '',
        logo: data.logo || '',
        banner: data.banner || '',
        adminId: userId,
        status: 'PENDING'
      },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    });

    console.log('✅ Cooperative registered:', cooperative);
    success(res, 'Koperasi berhasil didaftarkan', cooperative);
  } catch (error) {
    console.error('❌ Error registering cooperative:', error);
    next(error);
  }
});

// ============================================
// GET STATUS KOPERASI
// ============================================
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const cooperative = await prisma.cooperativeDigital.findUnique({
      where: { adminId: userId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            members: true,
            products: true,
            loans: true,
            savings: true
          }
        }
      }
    });

    if (!cooperative) {
      return success(res, 'Belum memiliki koperasi', null);
    }
    
    success(res, 'Status koperasi', cooperative);
  } catch (error) {
    console.error('Error fetching cooperative status:', error);
    next(error);
  }
});

// ============================================
// GET DETAIL KOPERASI
// ============================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const cooperative = await prisma.cooperativeDigital.findUnique({
      where: { id: parseInt(id) },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        products: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });

    if (!cooperative) {
      return notFound(res, 'Koperasi tidak ditemukan');
    }
    
    success(res, 'Detail koperasi', cooperative);
  } catch (error) {
    console.error('Error fetching cooperative:', error);
    next(error);
  }
});

// ============================================
// MEMBERS
// ============================================
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

// ============================================
// LOANS
// ============================================
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

// ============================================
// SHU (Sisa Hasil Usaha)
// ============================================
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

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    if (!cooperativeId) {
      return badRequest(res, 'Cooperative ID wajib diisi');
    }

    const [members, loans] = await Promise.all([
      memberService.getMembers(parseInt(cooperativeId)),
      loanService.getLoans(parseInt(cooperativeId))
    ]);

    const dashboard = {
      totalMembers: members.length,
      activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
      totalSavings: 0,
      totalRevenue: 0,
      recentMembers: members.slice(0, 5),
      recentLoans: loans.slice(0, 5)
    };

    success(res, 'Dashboard koperasi', dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    next(error);
  }
});

module.exports = router;