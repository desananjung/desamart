// backend/src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (name, email, password, role = 'BUYER') => {
  // Validasi role yang diizinkan
  const allowedRoles = ['BUYER', 'SELLER', 'ADMIN'];
  if (!allowedRoles.includes(role)) {
    throw new Error('Role tidak valid');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email sudah terdaftar');

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return user;
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Email atau password salah');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Email atau password salah');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

module.exports = { register, login };