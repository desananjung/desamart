// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { success, created, badRequest, conflict } = require('../utils/responseHelper');

// ============================================
// REGISTER
// ============================================
const register = async (req, res) => {
  try {
    const { name, email, password, role, storeName, villageId } = req.body;

    console.log('📝 Register attempt:', { email, role, name });

    // Validasi input
    if (!name || !email || !password) {
      return badRequest(res, 'Nama, email, dan password wajib diisi');
    }

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return conflict(res, 'Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ HAPUS isVerified dan isActive - tidak ada di schema!
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: role || 'BUYER',
        villageId: villageId ? parseInt(villageId) : null
      }
    });

    // Jika role SELLER, buat store
    if (user.role === 'SELLER') {
      const storeNameFinal = storeName || `${name}'s Store`;
      
      await prisma.store.create({
        data: {
          name: storeNameFinal,
          slug: storeNameFinal.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
          description: `Toko ${name}`,
          sellerId: user.id,
          isActive: true
        }
      });
    }

    // Buat token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ User registered:', user.id);

    created(res, 'Registrasi berhasil', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal registrasi',
      error: error.message
    });
  }
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Login attempt:', { email });

    if (!email || !password) {
      return badRequest(res, 'Email dan password wajib diisi');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: true }
    });

    if (!user) {
      return badRequest(res, 'Email atau password salah');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return badRequest(res, 'Email atau password salah');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );

    success(res, 'Login berhasil', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal login',
      error: error.message
    });
  }
};

// ============================================
// GET PROFILE
// ============================================
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        store: true,
        umkm: true
      }
    });

    if (!user) {
      return notFound(res, 'User tidak ditemukan');
    }

    success(res, 'Profile user', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: user.store,
      umkm: user.umkm
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};