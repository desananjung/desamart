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
const app = express();
const prisma = new PrismaClient();

// CORS - Izinkan semua origin untuk development
app.use(cors({
  origin: '*', // Untuk development, izinkan semua
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/umkm', umkmRoutes);
app.use('/api/koperasi', koperasiRoutes);
app.use('/api/cooperative', cooperativeRoutes);
app.use('/api/village', villageRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/agriculture', agricultureRoutes);
app.use('/api/categories', categoryRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: 'Connected'
  });
});

// Error handler (harus di akhir)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 DesaMart backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});