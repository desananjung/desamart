// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Import routes
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
const trackingRoutes = require('./routes/trackingRoutes');

const app = express();
const prisma = new PrismaClient();

// ============================================
// ✅ CORS CONFIGURATION - DI PERBAIKI
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8000',
  'https://desamart.vercel.app',
  'https://desamart-o7en5iflv-desamart.vercel.app',
  'https://desamart-h3a5lfidx-desamart.vercel.app',
  'https://73e9-182-10-130-155.ngrok-free.app',
  'https://3a2e-182-10-131-61.ngrok-free.app',
  /\.ngrok-free\.app$/,
  /\.vercel\.app$/,
  /\.localhost\.vercel\.app$/
];

// ✅ CORS Middleware - Lebih permisif untuk development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Untuk development, izinkan semua origin
  if (process.env.NODE_ENV === 'development' || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    const isAllowed = allowedOrigins.some(o => {
      if (o instanceof RegExp) return o.test(origin);
      return o === origin;
    });
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ CORS Configuration (sebagai backup)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    // Untuk development, izinkan semua
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    const isAllowed = allowedOrigins.some(o => {
      if (o instanceof RegExp) return o.test(origin);
      return o === origin;
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'ngrok-skip-browser-warning']
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// ROUTES
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
app.use('/api/tracking', trackingRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'DesaMart API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected'
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
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🚀 DesaMart Backend Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
});

// ============================================
// GRACEFUL SHUTDOWN
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