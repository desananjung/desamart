const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UMKMPostService {
  // 1. Create Post
  async createPost(umkmId, userId, data) {
    try {
      // Cek apakah user adalah member UMKM
      const member = await prisma.uMKMMember.findFirst({
        where: {
          umkmId,
          userId,
          isActive: true
        }
      });

      if (!member && userId !== (await prisma.uMKM.findUnique({ where: { id: umkmId } })).userId) {
        throw new Error('Anda bukan member UMKM ini');
      }

      return await prisma.uMKMPost.create({
        data: {
          umkmId,
          userId,
          title: data.title,
          content: data.content,
          type: data.type || 'PROMOSI',
          imageUrl: data.imageUrl,
          isPublished: data.isPublished !== false,
          publishedAt: data.isPublished !== false ? new Date() : null
        },
        include: {
          user: { select: { name: true } }
        }
      });
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // 2. Get UMKM Posts
  async getPosts(umkmId, limit = 10) {
    try {
      return await prisma.uMKMPost.findMany({
        where: {
          umkmId,
          isPublished: true
        },
        include: {
          user: { select: { name: true } }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  // 3. Get All UMKM Posts (Feed)
  async getFeed(limit = 20) {
    try {
      return await prisma.uMKMPost.findMany({
        where: {
          isPublished: true
        },
        include: {
          user: { select: { name: true } },
          umkm: {
            select: { id: true, name: true, slug: true, logo: true }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit
      });
    } catch (error) {
      console.error('Error getting feed:', error);
      throw error;
    }
  }

  // 4. Like/Unlike Post
  async toggleLike(postId, userId) {
    try {
      // Implementasi likes (bisa menggunakan model Like terpisah)
      // Untuk sekarang, kita increment/decrement likes
      const post = await prisma.uMKMPost.findUnique({
        where: { id: postId }
      });

      if (!post) {
        throw new Error('Post tidak ditemukan');
      }

      // Sederhana: increment likes
      return await prisma.uMKMPost.update({
        where: { id: postId },
        data: {
          likes: { increment: 1 }
        }
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
}

module.exports = new UMKMPostService();