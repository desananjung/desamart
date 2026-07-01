const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify'); // install: npm install slugify

const getAll = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
};

const getById = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error('Kategori tidak ditemukan');
  return category;
};

const create = async (name) => {
  const slug = slugify(name, { lower: true, strict: true });
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new Error('Kategori dengan nama tersebut sudah ada');
  return await prisma.category.create({
    data: { name, slug }
  });
};

const update = async (id, name) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error('Kategori tidak ditemukan');
  const slug = slugify(name, { lower: true, strict: true });
  return await prisma.category.update({
    where: { id },
    data: { name, slug }
  });
};

const remove = async (id) => {
  // Cek apakah ada produk yang menggunakan kategori ini
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new Error('Kategori tidak dapat dihapus karena masih digunakan oleh produk');
  return await prisma.category.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };