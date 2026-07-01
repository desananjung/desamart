const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProductReviews = async (productId) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return reviews;
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    throw error;
  }
};

const createReview = async (userId, productId, orderId, rating, comment) => {
  try {
    // Cek apakah user sudah membeli produk ini
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        userId,
        items: {
          some: {
            productId: parseInt(productId)
          }
        },
        status: 'DELIVERED'
      }
    });

    if (!order) {
      throw new Error('Anda belum membeli produk ini atau pesanan belum selesai');
    }

    // Cek apakah sudah review
    const existing = await prisma.review.findFirst({
      where: {
        userId,
        productId: parseInt(productId),
        orderId: parseInt(orderId)
      }
    });

    if (existing) {
      throw new Error('Anda sudah memberikan review untuk produk ini');
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: parseInt(productId),
        orderId: parseInt(orderId),
        rating: parseInt(rating),
        comment
      },
      include: {
        user: { select: { name: true } }
      }
    });

    // Update rating toko
    await updateStoreRating(parseInt(productId));

    return review;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
};

const updateStoreRating = async (productId) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: { include: { store: true } } }
    });

    if (product?.seller?.store) {
      const storeReviews = await prisma.review.aggregate({
        where: {
          product: {
            sellerId: product.sellerId
          }
        },
        _avg: { rating: true }
      });

      await prisma.store.update({
        where: { id: product.seller.store.id },
        data: {
          rating: storeReviews._avg.rating || 0
        }
      });
    }
  } catch (error) {
    console.error('Error in updateStoreRating:', error);
  }
};

module.exports = { getProductReviews, createReview };