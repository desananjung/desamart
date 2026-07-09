// backend/src/controllers/productController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { success, created, badRequest, notFound, conflict, forbidden } = require('../utils/responseHelper');

// ============================================
// GET ALL PRODUCTS
// ============================================
const getAll = async (req, res) => {
  try {
    console.log('📦 Fetching all products...');
    
    // ✅ GANTI prisma.produk → prisma.Product
    const products = await prisma.Product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            store: {
              select: {
                id: true,
                name: true,
                description: true,
                logo: true
              }
            }
          }
        },
        category: true,
        store: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    console.log(`✅ Found ${products.length} products`);

    const formattedProducts = products.map(p => ({
      ...p,
      storeName: p.store?.name || p.seller?.store?.name || 'Toko Makmur',
      sellerName: p.seller?.name || 'Unknown Seller',
      store: p.store || p.seller?.store || null
    }));

    res.json({
      success: true,
      message: 'Daftar produk',
      data: formattedProducts
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil produk',
      error: error.message
    });
  }
};

// ============================================
// GET PRODUCT BY ID
// ============================================
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching product ${id}...`);
    
    // ✅ GANTI prisma.produk → prisma.Product
    const product = await prisma.Product.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            store: {
              select: {
                id: true,
                name: true,
                description: true,
                logo: true
              }
            }
          }
        },
        category: true,
        store: {
          select: {
            id: true,
            name: true,
            description: true,
            logo: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan'
      });
    }

    const formattedProduct = {
      ...product,
      storeName: product.store?.name || product.seller?.store?.name || 'Toko Makmur',
      sellerName: product.seller?.name || 'Unknown Seller',
      store: product.store || product.seller?.store || null
    };

    res.json({
      success: true,
      message: 'Detail produk',
      data: formattedProduct
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil produk',
      error: error.message
    });
  }
};

// ============================================
// CREATE PRODUCT
// ============================================
const create = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    
    console.log('📦 Creating product:', { name, price, categoryId, sellerId: req.user.id });
    
    if (!name || !price || !categoryId) {
      return badRequest(res, 'Nama, harga, dan kategori wajib diisi');
    }
    
    // ✅ GANTI prisma.produk → prisma.Product
    // Cek duplikat
    const existing = await prisma.Product.findFirst({
      where: { name: name }
    });
    
    if (existing) {
      return conflict(res, 'Nama produk sudah digunakan, gunakan nama lain');
    }
    
    // Cari store seller
    const seller = await prisma.User.findUnique({
      where: { id: req.user.id },
      include: { store: true }
    });
    
    const storeId = seller?.store?.id || null;
    
    // ✅ GANTI prisma.produk → prisma.Product
    const product = await prisma.Product.create({
      data: {
        name: name,
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || null,
        sellerId: req.user.id,
        storeId: storeId,
        slug: name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
      }
    });
    
    console.log('✅ Product created:', product.id);
    created(res, 'Produk berhasil dibuat', product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat produk',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================
const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ GANTI prisma.produk → prisma.Product
    const product = await prisma.Product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return notFound(res, 'Produk tidak ditemukan');
    }
    
    if (req.user.role !== 'ADMIN' && product.sellerId !== req.user.id) {
      return forbidden(res, 'Anda tidak memiliki akses');
    }
    
    // ✅ GANTI prisma.produk → prisma.Product
    const updated = await prisma.Product.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    
    success(res, 'Produk berhasil diperbarui', updated);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal update produk',
      error: error.message
    });
  }
};

// ============================================
// DELETE PRODUCT
// ============================================
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ GANTI prisma.produk → prisma.Product
    const product = await prisma.Product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return notFound(res, 'Produk tidak ditemukan');
    }
    
    if (req.user.role !== 'ADMIN' && product.sellerId !== req.user.id) {
      return forbidden(res, 'Anda tidak memiliki akses');
    }
    
    // ✅ GANTI prisma.produk → prisma.Product
    await prisma.Product.delete({
      where: { id: parseInt(id) }
    });
    
    success(res, 'Produk berhasil dihapus');
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal hapus produk',
      error: error.message
    });
  }
};

// ============================================
// EXPORT
// ============================================
module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};