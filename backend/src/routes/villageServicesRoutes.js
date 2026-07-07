const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound, created } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.use(authenticate);

// ========== EBOOK DESA ==========
router.get('/ebooks', async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    
    const ebooks = await prisma.villageEbook.findMany({
      where,
      include: { uploader: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Daftar ebook desa', ebooks);
  } catch (error) { next(error); }
});

router.post('/ebooks', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, author, price, fileUrl, coverUrl, category } = req.body;
    if (!title || !fileUrl) return badRequest(res, 'Judul dan file wajib diisi');
    
    const ebook = await prisma.villageEbook.create({
      data: {
        title,
        description,
        author: author || 'DesaMart',
        price: parseFloat(price) || 0,
        fileUrl,
        coverUrl,
        category: category || 'PANDUAN',
        uploadedBy: req.user.id
      }
    });
    created(res, 'Ebook berhasil ditambahkan', ebook);
  } catch (error) { next(error); }
});

// ========== PPOB ==========
router.post('/ppob/pay', async (req, res, next) => {
  try {
    const { type, provider, customerId, customerName, amount } = req.body;
    if (!type || !provider || !customerId || !amount) {
      return badRequest(res, 'Data tidak lengkap');
    }
    
    const invoiceNumber = `PPOB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const ppob = await prisma.pPOB.create({
      data: {
        type,
        provider,
        customerId,
        customerName,
        amount: parseFloat(amount),
        adminFee: 2000,
        paidBy: req.user.id,
        invoiceNumber,
        status: 'PAID',
        paidAt: new Date()
      }
    });
    created(res, 'Pembayaran PPOB berhasil', ppob);
  } catch (error) { next(error); }
});

router.get('/ppob/history', async (req, res, next) => {
  try {
    const ppobs = await prisma.pPOB.findMany({
      where: { paidBy: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    success(res, 'Riwayat PPOB', ppobs);
  } catch (error) { next(error); }
});

// ========== KURIR DESA ==========
router.get('/couriers', async (req, res, next) => {
  try {
    const couriers = await prisma.villageCourier.findMany({
      where: { isActive: true },
      orderBy: { rating: 'desc' }
    });
    success(res, 'Daftar kurir desa', couriers);
  } catch (error) { next(error); }
});

router.get('/courier-orders', async (req, res, next) => {
  try {
    const orders = await prisma.villageCourierOrder.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        courier: true,
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Daftar pesanan kurir', orders);
  } catch (error) { next(error); }
});

// ========== REGISTER COURIER ==========
router.post('/couriers/register', async (req, res, next) => {
  try {
    const { name, phone, vehicle, area, fee } = req.body;
    if (!name || !phone || !vehicle || !area || !fee) {
      return badRequest(res, 'Semua field wajib diisi');
    }

    const courier = await prisma.villageCourier.create({
      data: {
        name,
        phone,
        vehicle,
        area,
        fee: parseFloat(fee),
        isActive: true
      }
    });
    created(res, 'Kurir berhasil didaftarkan', courier);
  } catch (error) {
    console.error('Error registering courier:', error);
    next(error);
  }
});

// ========== LOWONGAN KERJA ==========
router.get('/jobs', async (req, res, next) => {
  try {
    const { type } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;
    
    const jobs = await prisma.villageJob.findMany({
      where,
      include: {
        poster: { select: { name: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Daftar lowongan kerja', jobs);
  } catch (error) { next(error); }
});

router.post('/jobs', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, company, location, type, salary, requirements, contact, deadline } = req.body;
    if (!title || !description || !company || !contact) {
      return badRequest(res, 'Data tidak lengkap');
    }
    
    const job = await prisma.villageJob.create({
      data: {
        title,
        description,
        company,
        location: location || 'Desa',
        type: type || 'FULLTIME',
        salary,
        requirements,
        contact,
        postedBy: req.user.id,
        deadline: deadline ? new Date(deadline) : null
      }
    });
    created(res, 'Lowongan kerja berhasil ditambahkan', job);
  } catch (error) { next(error); }
});

// ========== LIVE SHOPPING ==========
router.get('/live', async (req, res, next) => {
  try {
    const lives = await prisma.villageLiveShopping.findMany({
      where: { isActive: true },
      include: {
        host: { select: { name: true } },
        products: {
          include: { product: { select: { name: true, imageUrl: true } } }
        }
      },
      orderBy: { startTime: 'desc' }
    });
    success(res, 'Daftar live shopping', lives);
  } catch (error) { next(error); }
});

router.post('/live', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, streamUrl, thumbnail, startTime, endTime } = req.body;
    if (!title || !streamUrl || !startTime || !endTime) {
      return badRequest(res, 'Data tidak lengkap');
    }
    
    const live = await prisma.villageLiveShopping.create({
      data: {
        title,
        description,
        streamUrl,
        thumbnail,
        hostId: req.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    created(res, 'Live shopping berhasil dibuat', live);
  } catch (error) { next(error); }
});

module.exports = router;