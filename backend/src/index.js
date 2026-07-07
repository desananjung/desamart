// backend/server.js atau backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorHandler');
const paymentRoutes = require('./routes/paymentRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const umkmRoutes = require('./routes/umkmRoutes');
const koperasiRoutes = require('./routes/koperasiRoutes');
const cooperativeRoutes = require('./routes/cooperativeRoutes');
const villageRoutes = require('./routes/villageRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const agricultureRoutes = require('./routes/agricultureRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const villageServicesRoutes = require('./routes/villageServicesRoutes');
const desaAdminRoutes = require('./routes/desaAdminRoutes');
const courierRoutes = require('./routes/courierRoutes');

const app = express();
const prisma = new PrismaClient();

// ============================================
// ✅ CORS - KONFIGURASI LENGKAP
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8000',
  'https://desamart.vercel.app',
  'https://desamart-o7en5iflv-desamart.vercel.app',
  'https://desamart-h3a5lfidx-desamart.vercel.app',
  'https://73e9-182-10-130-155.ngrok-free.app', // ← URL NGROK BARU
  'https://3a2e-182-10-131-61.ngrok-free.app',
  // Tambahkan semua subdomain ngrok
  /\.ngrok-free\.app$/,
  /\.vercel\.app$/,
  /\.localhost\.vercel\.app$/
];

// CORS Middleware dengan logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`📡 Request from: ${origin} | Method: ${req.method} | Path: ${req.path}`);
  next();
});

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ No origin, allowing');
      return callback(null, true);
    }
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(o => {
      if (o instanceof RegExp) {
        return o.test(origin);
      }
      return o === origin;
    });
    
    if (isAllowed) {
      console.log(`✅ CORS allowed for: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'ngrok-skip-browser-warning',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests manually
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = allowedOrigins.some(o => {
      if (o instanceof RegExp) return o.test(origin);
      return o === origin;
    });
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }
  }
  res.sendStatus(204);
});

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// 🚀 ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/umkm', umkmRoutes);
app.use('/api/koperasi', koperasiRoutes);
app.use('/api/cooperative', cooperativeRoutes);
app.use('/api/village', villageRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/agriculture', agricultureRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/village-services', villageServicesRoutes);
app.use('/api/desa-admin', desaAdminRoutes);
app.use('/api/couriers', courierRoutes);

// ============================================
// ✅ HEALTH CHECK - DENGAN INFO LENGKAP
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'OK',
      message: 'DesaMart API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected',
      cors: {
        allowedOrigins: allowedOrigins.map(o => o instanceof RegExp ? o.source : o),
        count: allowedOrigins.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// ============================================
// ✅ 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ✅ ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// ✅ START SERVER
// ============================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 DesaMart Backend Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for ${allowedOrigins.length} origins`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('📋 Routes:');
console.log('  /api/couriers/couriers - GET - Daftar kurir');
console.log('  /api/couriers/couriers/:id - GET - Detail kurir');
console.log('  /api/couriers/calculate-cost - POST - Hitung biaya');
console.log('  /api/couriers/deliveries - POST - Buat pengiriman');
console.log('  /api/couriers/deliveries/:id/status - PUT - Update status');
console.log('  /api/couriers/deliveries/order/:orderId - GET - Detail delivery');
console.log('  /api/couriers/my-deliveries - GET - Daftar delivery user');
console.log('  /api/couriers/admin/couriers - POST - Tambah kurir (admin)');
console.log('  /api/couriers/admin/couriers/:id - PUT - Update kurir (admin)');
console.log('  /api/couriers/admin/couriers/:id - DELETE - Hapus kurir (admin)');
  
  // Log allowed origins
  console.log('\n📋 Allowed Origins:');
  allowedOrigins.forEach((origin, i) => {
    if (origin instanceof RegExp) {
      console.log(`  ${i + 1}. ${origin.source} (regex)`);
    } else {
      console.log(`  ${i + 1}. ${origin}`);
    }
  });
  console.log('='.repeat(60));
});

// ============================================
// ✅ GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { app, prisma };