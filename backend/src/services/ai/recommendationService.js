const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache 1 jam

class RecommendationService {
  // 1. Rekomendasi berdasarkan riwayat pembelian
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      // Cek cache
      const cacheKey = `recommendations_${userId}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      // Ambil produk yang pernah dibeli user
      const userOrders = await prisma.order.findMany({
        where: { userId, status: 'DELIVERED' },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });

      // Jika tidak ada riwayat pembelian, return produk populer
      if (userOrders.length === 0) {
        return await this.getPopularProducts(limit);
      }

      // Analisis preferensi user berdasarkan kategori
      const categoryPreferences = {};
      const sellerPreferences = {};
      const priceRange = { min: Infinity, max: 0 };

      userOrders.forEach(order => {
        order.items.forEach(item => {
          const product = item.product;
          // Hitung preferensi kategori
          categoryPreferences[product.categoryId] = 
            (categoryPreferences[product.categoryId] || 0) + item.quantity;
          
          // Hitung preferensi seller
          sellerPreferences[product.sellerId] = 
            (sellerPreferences[product.sellerId] || 0) + item.quantity;
          
          // Update price range
          if (product.price < priceRange.min) priceRange.min = product.price;
          if (product.price > priceRange.max) priceRange.max = product.price;
        });
      });

      // Sort kategori berdasarkan preferensi
      const topCategories = Object.entries(categoryPreferences)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([categoryId]) => parseInt(categoryId));

      // Dapatkan rekomendasi
      const recommendations = await prisma.product.findMany({
        where: {
          AND: [
            { categoryId: { in: topCategories } },
            { id: { notIn: await this.getPurchasedProductIds(userId) } },
            { stock: { gt: 0 } }
          ]
        },
        include: {
          category: true,
          seller: { include: { store: true } }
        },
        orderBy: {
          // Sort berdasarkan skor preferensi
          createdAt: 'desc'
        },
        take: limit
      });

      // Jika rekomendasi kurang dari limit, tambahkan produk populer
      if (recommendations.length < limit) {
        const popular = await this.getPopularProducts(limit - recommendations.length);
        recommendations.push(...popular);
      }

      // Simpan ke cache
      cache.set(cacheKey, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // 2. Produk Populer
  async getPopularProducts(limit = 10) {
    const popular = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      include: {
        category: true,
        seller: { include: { store: true } }
      },
      orderBy: {
        // Diurutkan berdasarkan total penjualan (dari order items)
        id: 'desc' // Sementara, nanti bisa dihitung dari order items
      },
      take: limit
    });
    return popular;
  }

  // 3. Produk Terkait (Similar Products)
  async getSimilarProducts(productId, limit = 5) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      });

      if (!product) return [];

      const similar = await prisma.product.findMany({
        where: {
          AND: [
            { categoryId: product.categoryId },
            { id: { not: productId } },
            { stock: { gt: 0 } }
          ]
        },
        include: {
          category: true,
          seller: { include: { store: true } }
        },
        orderBy: {
          // Rekomendasi berdasarkan harga yang mirip
          price: 'asc'
        },
        take: limit
      });

      return similar;
    } catch (error) {
      console.error('Error getting similar products:', error);
      return [];
    }
  }

  // 4. Produk yang Sering Dibeli Bersamaan
  async getFrequentlyBoughtTogether(productId, limit = 5) {
    try {
      // Ambil order yang mengandung produk ini
      const ordersWithProduct = await prisma.order.findMany({
        where: {
          items: {
            some: { productId }
          },
          status: 'DELIVERED'
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        take: 50
      });

      // Hitung frekuensi produk lain yang muncul bersama
      const frequency = {};
      ordersWithProduct.forEach(order => {
        order.items.forEach(item => {
          if (item.productId !== productId) {
            frequency[item.productId] = (frequency[item.productId] || 0) + 1;
          }
        });
      });

      // Sort berdasarkan frekuensi
      const productIds = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => parseInt(id));

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          category: true,
          seller: { include: { store: true } }
        }
      });

      return products;
    } catch (error) {
      console.error('Error getting frequently bought together:', error);
      return [];
    }
  }

  // Helper: Get purchased product IDs
  async getPurchasedProductIds(userId) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          select: { productId: true }
        }
      }
    });
    const productIds = new Set();
    orders.forEach(order => {
      order.items.forEach(item => productIds.add(item.productId));
    });
    return Array.from(productIds);
  }

  // 5. Clear cache
  clearCache(userId) {
    const cacheKey = `recommendations_${userId}`;
    cache.del(cacheKey);
  }
}

module.exports = new RecommendationService();