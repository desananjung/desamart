const express = require('express');
const { authenticate } = require('../middlewares/authMiddleware');
const { success } = require('../utils/responseHelper');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.use(authenticate);

// Get all notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    success(res, 'Notifikasi', notifications);
  } catch (error) { next(error); }
});

// Get unread count
router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    success(res, 'Unread count', { count });
  } catch (error) { next(error); }
});

// Mark as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { isRead: true, readAt: new Date() }
    });
    success(res, 'Notifikasi ditandai sudah dibaca', notification);
  } catch (error) { next(error); }
});

// Mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    success(res, 'Semua notifikasi sudah dibaca');
  } catch (error) { next(error); }
});

module.exports = router;