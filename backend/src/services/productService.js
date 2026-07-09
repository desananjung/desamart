// backend/src/services/productService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

// ✅ GANTI SEMUA prisma.produk → prisma.Product
// ✅ GANTI prisma.user → prisma.User

const getAll = async (filters) => {
  return await prisma.Product.findMany({
    where: filters,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          store: true
        }
      },
      category: true,
      store: true
    },
    orderBy: { id: 'desc' }
  });
};

const getById = async (id) => {
  const product = await prisma.Product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          store: true
        }
      },
      category: true,
      store: true
    }
  });
  
  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }
  
  return product;
};

const create = async (data, sellerId) => {
  const existing = await prisma.Product.findFirst({
    where: { name: data.name }
  });
  
  if (existing) {
    throw new Error('Nama produk sudah digunakan, gunakan nama lain');
  }
  
  // Cari store seller
  const seller = await prisma.User.findUnique({
    where: { id: sellerId },
    include: { store: true }
  });
  
  const storeId = seller?.store?.id || null;
  
  return await prisma.Product.create({
    data: {
      name: data.name,
      description: data.description || '',
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      categoryId: parseInt(data.categoryId),
      imageUrl: data.imageUrl || null,
      sellerId: sellerId,
      storeId: storeId,
      slug: slugify(data.name, { lower: true }) + '-' + Date.now()
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          store: true
        }
      },
      category: true,
      store: true
    }
  });
};

const update = async (id, data, userId, isAdmin) => {
  const product = await prisma.Product.findUnique({ 
    where: { id },
    include: { seller: true }
  });
  
  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }
  
  if (!isAdmin && product.sellerId !== userId) {
    throw new Error('Anda tidak memiliki akses untuk mengupdate produk ini');
  }
  
  const updateData = { ...data };
  if (data.price) updateData.price = parseFloat(data.price);
  if (data.stock) updateData.stock = parseInt(data.stock);
  if (data.categoryId) updateData.categoryId = parseInt(data.categoryId);
  
  return await prisma.Product.update({
    where: { id },
    data: updateData,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          store: true
        }
      },
      category: true,
      store: true
    }
  });
};

const remove = async (id, userId, isAdmin) => {
  const product = await prisma.Product.findUnique({ 
    where: { id },
    include: { seller: true }
  });
  
  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }
  
  if (!isAdmin && product.sellerId !== userId) {
    throw new Error('Anda tidak memiliki akses untuk menghapus produk ini');
  }
  
  return await prisma.Product.delete({ where: { id } });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};