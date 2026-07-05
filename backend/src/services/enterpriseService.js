const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class EnterpriseService {
  async createEnterprise(userId, data) {
    try {
      console.log('📝 Creating enterprise for user:', userId);
      console.log('📦 Data:', data);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { enterpriseOwner: true }
      });

      if (!user) throw new Error('User tidak ditemukan');
      if (user.enterpriseOwner) throw new Error('Anda sudah memiliki enterprise');

      const slug = slugify(data.name, { lower: true, strict: true });
      
      const existing = await prisma.enterprise.findUnique({
        where: { slug }
      });
      if (existing) throw new Error('Nama enterprise sudah digunakan');

      const enterprise = await prisma.enterprise.create({
        data: {
          name: data.name,
          slug,
          description: data.description || '',
          type: data.type || 'UMKM',
          address: data.address,
          phone: data.phone,
          email: data.email || '',
          website: data.website || '',
          logo: data.logo || '',
          banner: data.banner || '',
          ownerId: userId,
          status: 'ACTIVE'
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      console.log('✅ Enterprise created:', enterprise);
      return enterprise;
    } catch (error) {
      console.error('❌ Error in createEnterprise:', error);
      throw error;
    }
  }

  async getEnterprise(userId) {
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        },
        stores: {
          include: {
            store: {
              include: {
                products: {
                  take: 5,
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        },
        products: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        orders: {
          include: {
            order: {
              include: {
                user: {
                  select: { name: true, email: true }
                },
                items: {
                  include: {
                    product: {
                      select: { name: true, imageUrl: true }
                    }
                  }
                }
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            members: true,
            stores: true,
            products: true,
            orders: true
          }
        }
      }
    });
    return enterprise;
  }

  async updateEnterprise(userId, data) {
    const enterprise = await prisma.enterprise.findFirst({
      where: { ownerId: userId }
    });

    if (!enterprise) throw new Error('Enterprise tidak ditemukan');

    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.address) updateData.address = data.address;
    if (data.phone) updateData.phone = data.phone;
    if (data.email) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.banner !== undefined) updateData.banner = data.banner;

    return await prisma.enterprise.update({
      where: { id: enterprise.id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  async addMember(enterpriseId, userId, role = 'STAFF', permissions = {}) {
    const enterprise = await prisma.enterprise.findUnique({
      where: { id: enterpriseId }
    });
    if (!enterprise) throw new Error('Enterprise tidak ditemukan');

    const existing = await prisma.enterpriseMember.findFirst({
      where: { enterpriseId, userId }
    });
    if (existing) throw new Error('User sudah menjadi anggota');

    const member = await prisma.enterpriseMember.create({
      data: {
        enterpriseId,
        userId,
        role,
        permissions
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return member;
  }

  async getStats(userId) {
    const enterprise = await prisma.enterprise.findFirst({
      where: { ownerId: userId },
      include: {
        stores: { include: { store: true } },
        products: true,
        orders: true,
        members: true
      }
    });

    if (!enterprise) return null;

    const revenue = await prisma.order.aggregate({
      where: {
        enterpriseOrders: {
          some: {
            enterpriseId: enterprise.id
          }
        },
        status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }
      },
      _sum: {
        total: true
      }
    });

    return {
      enterprise,
      stats: {
        totalMembers: enterprise.members.length,
        totalStores: enterprise.stores.length,
        totalProducts: enterprise.products.length,
        totalOrders: enterprise.orders.length,
        totalRevenue: revenue._sum.total || 0
      }
    };
  }
}

module.exports = new EnterpriseService();