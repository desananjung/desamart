// backend/src/routes/notificationRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// GET ALL NOTIFICATIONS
// ============================================
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, page = 1, type, isRead } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead: isRead === 'true' })
    };
    
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.notification.count({ where })
    ]);
    
    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil notifikasi',
      error: error.message
    });
  }
});

// ============================================
// GET UNREAD COUNT
// ============================================
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    
    res.json({
      success: true,
      data: { unread: count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghitung notifikasi',
      error: error.message
    });
  }
});

// ============================================
// MARK AS READ
// ============================================
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }
    
    const updated = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca',
      data: updated
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal update notifikasi',
      error: error.message
    });
  }
});

// ============================================
// MARK ALL AS READ
// ============================================
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Semua notifikasi sudah dibaca'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal update notifikasi',
      error: error.message
    });
  }
});

// ============================================
// DELETE NOTIFICATION
// ============================================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifikasi tidak ditemukan'
      });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }
    
    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({
      success: true,
      message: 'Notifikasi berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal hapus notifikasi',
      error: error.message
    });
  }
});

// ============================================
// CREATE NOTIFICATION HELPER
// ============================================
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data
      }
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Export router dan helper
module.exports = router;