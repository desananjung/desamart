const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CommunityService {
  async createPost(userId, data) {
    const post = await prisma.uMKMCommunity.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        authorId: userId
      },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
    return post;
  }

  async getPosts(filters = {}) {
    const where = {};
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const posts = await prisma.uMKMCommunity.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true, role: true }
        },
        comments: {
          include: {
            author: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return posts;
  }

  async addComment(userId, postId, content, parentId = null) {
    const comment = await prisma.uMKMComment.create({
      data: {
        content,
        authorId: userId,
        postId,
        parentId
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });
    return comment;
  }

  async likePost(postId) {
    const post = await prisma.uMKMCommunity.update({
      where: { id: postId },
      data: {
        likes: { increment: 1 }
      }
    });
    return post;
  }
}

module.exports = new CommunityService();