// backend/src/controllers/uploadController.js
const fs = require('fs');
const path = require('path');

// Upload gambar produk
const uploadProductImage = async (req, res) => {
  try {
    // Cek apakah ada file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }

    // Dapatkan URL gambar (relative path)
    const imageUrl = `/uploads/${req.file.filename}`;

    // Kirim response dengan URL
    res.status(200).json({
      success: true,
      message: 'Gambar berhasil diupload',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal upload gambar',
      error: error.message
    });
  }
};

// Delete gambar (opsional)
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Cek apakah file ada
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }

    // Hapus file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Gambar berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal hapus gambar'
    });
  }
};

module.exports = {
  uploadProductImage,
  deleteImage
};