// backend/src/services/escrowService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLATFORM_FEE = 0.02; // 2% fee platform

/**
 * Buat escrow baru
 */
async function createEscrow(orderId, sellerId, amount) {
  try {
    const fee = amount * PLATFORM_FEE;
    const netAmount = amount - fee;
    
    const escrow = await prisma.escrow.create({
      data: {
        orderId: parseInt(orderId),
        sellerId: parseInt(sellerId),
        amount,
        fee,
        netAmount,
        status: 'HELD'
      }
    });
    
    return escrow;
  } catch (error) {
    console.error('Error creating escrow:', error);
    throw error;
  }
}

/**
 * Cairkan dana ke penjual
 */
async function releaseEscrow(orderId, adminId, transferProof = null, transferNote = null) {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { orderId: parseInt(orderId) }
    });
    
    if (!escrow) {
      throw new Error('Escrow tidak ditemukan');
    }
    
    if (escrow.status !== 'HELD') {
      throw new Error('Dana sudah dicairkan');
    }
    
    const updated = await prisma.escrow.update({
      where: { id: escrow.id },
      data: {
        status: 'RELEASED',
        releasedAt: new Date(),
        transferProof,
        transferNote
      }
    });
    
    return updated;
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
}

/**
 * Refund dana ke pembeli
 */
async function refundEscrow(orderId) {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { orderId: parseInt(orderId) }
    });
    
    if (!escrow) {
      throw new Error('Escrow tidak ditemukan');
    }
    
    const updated = await prisma.escrow.update({
      where: { id: escrow.id },
      data: {
        status: 'REFUNDED',
        cancelledAt: new Date()
      }
    });
    
    return updated;
  } catch (error) {
    console.error('Error refunding escrow:', error);
    throw error;
  }
}

/**
 * Get saldo penjual (total dana yang ditahan)
 */
async function getSellerBalance(sellerId) {
  try {
    const result = await prisma.escrow.aggregate({
      where: {
        sellerId: parseInt(sellerId),
        status: 'HELD'
      },
      _sum: {
        netAmount: true
      }
    });
    
    return result._sum.netAmount || 0;
  } catch (error) {
    console.error('Error getting seller balance:', error);
    throw error;
  }
}

module.exports = {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getSellerBalance,
  PLATFORM_FEE
};