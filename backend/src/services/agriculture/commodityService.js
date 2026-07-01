const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommodityService {
  async registerFarm(userId, data) {
    const farm = await prisma.farm.create({
      data: {
        name: data.name,
        location: data.location,
        area: parseFloat(data.area),
        description: data.description,
        imageUrl: data.imageUrl,
        farmerId: userId
      }
    });
    return farm;
  }

  async addCommodity(farmId, data) {
    const commodity = await prisma.farmCommodity.create({
      data: {
        farmId,
        commodity: data.commodity,
        category: data.category || 'SAYURAN',
        variety: data.variety,
        plantingDate: new Date(data.plantingDate),
        harvestEstimate: new Date(data.harvestEstimate),
        areaPlanted: parseFloat(data.areaPlanted),
        quantityEstimate: parseFloat(data.quantityEstimate)
      }
    });
    return commodity;
  }

  async recordHarvest(data) {
    const harvest = await prisma.harvest.create({
      data: {
        farmId: data.farmId,
        commodityId: data.commodityId,
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        quality: data.quality || 'STANDAR',
        harvestDate: new Date(data.harvestDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        price: parseFloat(data.price),
        imageUrl: data.imageUrl
      },
      include: {
        farm: true,
        commodity: true
      }
    });
    return harvest;
  }

  async getMarketPrices(commodity, limit = 20) {
    const prices = await prisma.marketPrice.findMany({
      where: commodity ? { commodity: { contains: commodity, mode: 'insensitive' } } : {},
      orderBy: { date: 'desc' },
      take: limit
    });
    return prices;
  }

  async getSeasonInfo(year) {
    const seasons = await prisma.seasonInfo.findMany({
      where: { year: year || new Date().getFullYear() },
      orderBy: { startDate: 'asc' }
    });
    return seasons;
  }
}

module.exports = new CommodityService();