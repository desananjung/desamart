// backend/src/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middlewares/authMiddleware');
const { success, badRequest } = require('../utils/responseHelper');

const router = express.Router();

// ============================================
// STORAGE CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// ============================================
// FILE FILTER
// ============================================
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya gambar yang diperbolehkan (jpeg, jpg, png, gif, webp)'));
  }
};

// ============================================
// ✅ UPLOAD MIDDLEWARE - DEFINISIKAN DI SINI
// ============================================
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// ============================================
// UPLOAD SINGLE IMAGE
// ============================================
router.post('/product', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📄 File:', req.file);

    if (!req.file) {
      return badRequest(res, 'Tidak ada file yang diupload');
    }

    // Dapatkan base URL dari request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const imageUrl = `/uploads/products/${req.file.filename}`;
    const fullUrl = `${baseUrl}${imageUrl}`;
    
    console.log('✅ Image uploaded successfully');
    console.log('📸 Image URL:', imageUrl);
    console.log('📸 Full URL:', fullUrl);
    
    success(res, 'Gambar berhasil diupload', {
      imageUrl: imageUrl,
      fullUrl: fullUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal upload gambar',
      error: error.message
    });
  }
});

// ============================================
// UPLOAD MULTIPLE IMAGES
// ============================================
router.post('/products', authenticate, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return badRequest(res, 'Tidak ada file yang diupload');
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    const fullUrls = req.files.map(file => `${baseUrl}/uploads/products/${file.filename}`);
    
    success(res, 'Gambar berhasil diupload', {
      images: imageUrls,
      fullUrls: fullUrls,
      count: imageUrls.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal upload gambar',
      error: error.message
    });
  }
});

// ============================================
// DELETE IMAGE
// ============================================
router.delete('/product/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/products/', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      success(res, 'Gambar berhasil dihapus');
    } else {
      badRequest(res, 'Gambar tidak ditemukan');
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal hapus gambar',
      error: error.message
    });
  }
});

module.exports = router;