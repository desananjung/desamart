const express = require('express');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { success, badRequest, notFound, created } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.use(authenticate);

// ========== GET ALL PRODUCTS ==========
router.get('/products', async (req, res, next) => {
  try {
    const { type, category } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;
    if (category) where.category = category;
    
    const products = await prisma.desaAdminProduct.findMany({
      where,
      include: {
        uploader: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Produk administrasi desa', products);
  } catch (error) { next(error); }
});

// ========== CREATE PRODUCT ==========
router.post('/products', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, description, type, price, fileUrl, imageUrl, category, sample, duration, level, serviceTime, includes } = req.body;
    if (!title || !type) return badRequest(res, 'Judul dan jenis wajib diisi');
    
    const product = await prisma.desaAdminProduct.create({
      data: {
        title,
        description,
        type,
        price: parseFloat(price) || 0,
        fileUrl,
        imageUrl,
        category: category || 'Administrasi',
        sample,
        duration,
        level,
        serviceTime,
        includes,
        uploadedBy: req.user.id
      }
    });
    created(res, 'Produk berhasil ditambahkan', product);
  } catch (error) { next(error); }
});

// ========== GET PRODUCT BY ID ==========
router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await prisma.desaAdminProduct.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        uploader: { select: { name: true } }
      }
    });
    if (!product) return notFound(res, 'Produk tidak ditemukan');
    success(res, 'Detail produk', product);
  } catch (error) { next(error); }
});

// ========== ORDER PRODUCT ==========
router.post('/orders', async (req, res, next) => {
  try {
    const { productId, notes, deadline } = req.body;
    if (!productId) return badRequest(res, 'Product ID wajib diisi');
    
    const product = await prisma.desaAdminProduct.findUnique({
      where: { id: parseInt(productId) }
    });
    if (!product) return notFound(res, 'Produk tidak ditemukan');
    
    const order = await prisma.desaAdminOrder.create({
      data: {
        productId: parseInt(productId),
        buyerId: req.user.id,
        amount: product.price,
        notes,
        deadline: deadline ? new Date(deadline) : null
      },
      include: {
        product: true,
        buyer: { select: { name: true } }
      }
    });
    created(res, 'Pesanan berhasil dibuat', order);
  } catch (error) { next(error); }
});

// ========== GET MY ORDERS ==========
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await prisma.desaAdminOrder.findMany({
      where: { buyerId: req.user.id },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });
    success(res, 'Pesanan administrasi', orders);
  } catch (error) { next(error); }
});

module.exports = router;