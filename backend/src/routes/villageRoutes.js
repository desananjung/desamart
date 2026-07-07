const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

// ========== INFORMASI DESA ==========
router.get('/info', async (req, res, next) => {
  try {
    const { category, limit = 10 } = req.query;
    const where = {};
    if (category) where.category = category;
    
    const infos = await prisma.villageInfo.findMany({
      where,
      include: {
        author: { select: { name: true } }
      },
      orderBy: [
        { isPinned: 'desc' },
        { isUrgent: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit)
    });
    success(res, 'Informasi desa', infos);
  } catch (error) { next(error); }
});

router.post('/info', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, content, category, imageUrl, isPinned, isUrgent } = req.body;
    if (!title || !content) return badRequest(res, 'Judul dan konten wajib diisi');
    
    const info = await prisma.villageInfo.create({
      data: {
        title,
        content,
        category: category || 'BERITA',
        imageUrl,
        isPinned: isPinned || false,
        isUrgent: isUrgent || false,
        authorId: req.user.id
      }
    });
    success(res, 'Informasi berhasil ditambahkan', info);
  } catch (error) { next(error); }
});

// ========== PENGADUAN ==========
router.post('/complaints', async (req, res, next) => {
  try {
    const { title, description, category, location, imageUrl } = req.body;
    if (!title || !description) return badRequest(res, 'Judul dan deskripsi wajib diisi');
    
    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category: category || 'LAINNYA',
        location,
        imageUrl,
        reporterId: req.user.id
      }
    });
    success(res, 'Pengaduan berhasil dikirim', complaint);
  } catch (error) { next(error); }
});

router.get('/complaints', async (req, res, next) => {
  try {
    const { status, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        reporter: { select: { name: true } },
        assigned: { select: { name: true } },
        responses: {
          include: { author: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    success(res, 'Daftar pengaduan', complaints);
  } catch (error) { next(error); }
});

// ========== KEGIATAN DESA ==========
router.post('/events', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, location, startDate, endDate, category, imageUrl, organizer, contact } = req.body;
    if (!title || !location || !startDate || !endDate) {
      return badRequest(res, 'Judul, lokasi, dan tanggal wajib diisi');
    }
    
    const event = await prisma.villageEvent.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category: category || 'KEGIATAN',
        imageUrl,
        organizer: organizer || '',
        contact: contact || '',
        isPublished: true
      }
    });
    created(res, 'Kegiatan berhasil ditambahkan', event);
  } catch (error) { next(error); }
});

// ========== DOKUMEN ADMINISTRASI ==========
router.post('/documents', async (req, res, next) => {
  try {
    const { title, description, type, fileUrl } = req.body;
    if (!title || !type) return badRequest(res, 'Judul dan jenis dokumen wajib diisi');
    
    const doc = await prisma.villageDocument.create({
      data: {
        title,
        description,
        type,
        fileUrl,
        requesterId: req.user.id
      }
    });
    success(res, 'Dokumen berhasil diajukan', doc);
  } catch (error) { next(error); }
});

router.get('/documents', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const docs = await prisma.villageDocument.findMany({
      where,
      include: {
        requester: { select: { name: true } },
        officer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Dokumen administrasi', docs);
  } catch (error) { next(error); }
});

// ========== DONASI ==========
router.post('/donations', async (req, res, next) => {
  try {
    const { title, description, targetAmount, category, startDate, endDate, imageUrl } = req.body;
    if (!title || !targetAmount || !startDate || !endDate) {
      return badRequest(res, 'Data donasi tidak lengkap');
    }
    
    const donation = await prisma.donation.create({
      data: {
        title,
        description,
        targetAmount: parseFloat(targetAmount),
        category: category || 'SOSIAL',
        organizerId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl
      }
    });
    success(res, 'Donasi berhasil dibuat', donation);
  } catch (error) { next(error); }
});

router.get('/donations', async (req, res, next) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { isActive: true },
      include: {
        organizer: { select: { name: true } },
        donors: {
          include: { donor: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Daftar donasi', donations);
  } catch (error) { next(error); }
});

// ========== INFO BENCANA ==========
router.post('/disasters', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, type, location, severity, imageUrl } = req.body;
    if (!title || !type || !location) {
      return badRequest(res, 'Judul, jenis, dan lokasi wajib diisi');
    }
    
    const disaster = await prisma.disasterInfo.create({
      data: {
        title,
        description,
        type,
        location,
        severity: severity || 'SEDANG',
        imageUrl,
        reportedBy: req.user.id
      }
    });
    success(res, 'Info bencana berhasil dilaporkan', disaster);
  } catch (error) { next(error); }
});

router.get('/disasters', async (req, res, next) => {
  try {
    const disasters = await prisma.disasterInfo.findMany({
      where: { isActive: true },
      include: {
        reporter: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Info bencana terkini', disasters);
  } catch (error) { next(error); }
});

// ========== VILLAGE DATA ==========
router.get('/user-village', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        village: {
          include: {
            umkm: true,
            products: true,
            economy: {
              orderBy: { year: 'desc' },
              take: 12
            }
          }
        }
      }
    });
    
    success(res, 'Data desa user', user?.village || null);
  } catch (error) { next(error); }
});

router.get('/all', async (req, res, next) => {
  try {
    const villages = await prisma.village.findMany({
      include: {
        _count: {
          select: { umkm: true, products: true, users: true }
        },
        economy: {
          orderBy: { year: 'desc' },
          take: 1
        }
      }
    });
    success(res, 'Daftar desa', villages);
  } catch (error) { next(error); }
});

module.exports = router;