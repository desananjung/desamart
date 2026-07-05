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
// const seedRoutes = require('./routes/seedRoutes'); // ← KOMENTAR

const app = express();
const prisma = new PrismaClient();

// ============================================
// CORS - Konfigurasi yang benar
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://desamart.vercel.app',
  'https://desamart-o7en5iflv-desamart.vercel.app',
  'https://desamart-h3a5lfidx-desamart.vercel.app',
  'https://830f-182-10-131-61.ngrok-free.app', // ← TAMBAHKAN INI
  /\.ngrok-free\.app$/,
  /\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => o === origin || (o instanceof RegExp && o.test(origin)))) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());

// ============================================
// Routes
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
// app.use('/api/seed', seedRoutes); // ← HAPUS atau KOMENTAR

// ============================================
// Health Check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: 'Connected'
  });
});

// ============================================
// Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 DesaMart backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for ${allowedOrigins.length} origins`);
});