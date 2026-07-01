const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

const getAll = async (filters = {}) => {
  const where = {};
  
  if (filters.categoryId) {
    where.categoryId = parseInt(filters.categoryId);
  }
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ];
  }
  
  if (filters.minPrice) {
    where.price = { gte: parseFloat(filters.minPrice) };
  }
  
  if (filters.maxPrice) {
    where.price = { ...where.price, lte: parseFloat(filters.maxPrice) };
  }

  return await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      seller: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      seller: { select: { id: true, name: true } }
    }
  });
  if (!product) throw new Error('Produk tidak ditemukan');
  return product;
};

const create = async (data, sellerId) => {
  const { name, description, price, stock, categoryId, imageUrl } = data;
  const slug = slugify(name, { lower: true, strict: true });
  
  // Cek slug unik
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new Error('Nama produk sudah digunakan, gunakan nama lain');
  
  return await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price: parseFloat(price),
      stock: parseInt(stock || 0),
      imageUrl,
      categoryId: parseInt(categoryId),
      sellerId
    },
    include: {
      category: { select: { name: true } }
    }
  });
};

const update = async (id, data, userId, isAdmin = false) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error('Produk tidak ditemukan');
  
  // Cek kepemilikan: hanya seller sendiri atau admin yang boleh mengedit
  if (!isAdmin && product.sellerId !== userId) {
    throw new Error('Anda tidak memiliki akses untuk mengedit produk ini');
  }
  
  const { name, description, price, stock, categoryId, imageUrl } = data;
  const updateData = {};
  
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name, { lower: true, strict: true });
  }
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (stock !== undefined) updateData.stock = parseInt(stock);
  if (categoryId) updateData.categoryId = parseInt(categoryId);
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

  return await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { name: true } }
    }
  });
};

const remove = async (id, userId, isAdmin = false) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error('Produk tidak ditemukan');
  
  if (!isAdmin && product.sellerId !== userId) {
    throw new Error('Anda tidak memiliki akses untuk menghapus produk ini');
  }
  
  return await prisma.product.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };