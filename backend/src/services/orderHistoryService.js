// backend/src/services/orderHistoryService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Tambahkan riwayat status pesanan
 */
async function addOrderHistory(orderId, status, description, actorId, actorRole, note = null, location = null, metadata = null) {
  try {
    const history = await prisma.orderStatusHistory.create({
      data: {
        orderId: parseInt(orderId),
        status,
        description,
        note,
        actorId: parseInt(actorId),
        actorRole,
        location,
        metadata
      }
    });
    
    // Update order status
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status }
    });
    
    return history;
  } catch (error) {
    console.error('Error adding order history:', error);
    throw error;
  }
}

/**
 * Get riwayat pesanan
 */
async function getOrderHistory(orderId) {
  try {
    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: parseInt(orderId) },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    return history;
  } catch (error) {
    console.error('Error getting order history:', error);
    throw error;
  }
}

/**
 * Get status terakhir pesanan
 */
async function getCurrentStatus(orderId) {
  try {
    const latest = await prisma.orderStatusHistory.findFirst({
      where: { orderId: parseInt(orderId) },
      orderBy: { createdAt: 'desc' }
    });
    
    return latest;
  } catch (error) {
    console.error('Error getting current status:', error);
    throw error;
  }
}

module.exports = {
  addOrderHistory,
  getOrderHistory,
  getCurrentStatus
};