const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWishlist = async (userId) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            seller: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return items;
  } catch (error) {
    console.error('Error in getWishlist:', error);
    throw error;
  }
};

const toggleWishlist = async (userId, productId) => {
  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });

    if (existing) {
      // Hapus dari wishlist
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      });
      return { action: 'removed', message: 'Dihapus dari wishlist' };
    } else {
      // Tambah ke wishlist
      const item = await prisma.wishlistItem.create({
        data: {
          userId,
          productId: parseInt(productId)
        }
      });
      return { action: 'added', message: 'Ditambahkan ke wishlist', data: item };
    }
  } catch (error) {
    console.error('Error in toggleWishlist:', error);
    throw error;
  }
};

const checkWishlist = async (userId, productId) => {
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    });
    return !!item;
  } catch (error) {
    console.error('Error in checkWishlist:', error);
    throw error;
  }
};

module.exports = { getWishlist, toggleWishlist, checkWishlist };