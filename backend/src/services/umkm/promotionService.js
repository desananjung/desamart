const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PromotionService {
  // Buat promo flash sale
  async createFlashSale(umkmId, data) {
    const promotion = await prisma.promotion.create({
      data: {
        name: data.name,
        description: data.description,
        type: 'FLASH_SALE',
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        productId: data.productId,
        umkmId,
        maxUsage: data.maxUsage || -1,
        isActive: true
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });
    return promotion;
  }

  // Dapatkan promo aktif
  async getActivePromotions(umkmId) {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        umkmId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });
    return promotions;
  }

  // Apply promo ke produk
  async applyPromotion(promotionId, productId) {
    const promotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        productId,
        usedCount: { increment: 1 }
      }
    });
    return promotion;
  }
}

module.exports = new PromotionService();