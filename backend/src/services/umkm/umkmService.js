const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class UMKMService {
  // 1. Registrasi UMKM
  async registerUMKM(userId, data) {
    try {
      // Cek apakah user sudah punya UMKM
      const existing = await prisma.uMKM.findUnique({
        where: { userId }
      });
      if (existing) {
        throw new Error('Anda sudah memiliki UMKM terdaftar');
      }

      // Generate slug
      const slug = slugify(data.name, { lower: true, strict: true });
      
      // Cek slug unik
      const slugExists = await prisma.uMKM.findUnique({
        where: { slug }
      });
      if (slugExists) {
        throw new Error('Nama UMKM sudah digunakan');
      }

      const umkm = await prisma.uMKM.create({
        data: {
          userId,
          name: data.name,
          slug,
          description: data.description,
          type: data.type || 'MIKRO',
          category: data.category,
          established: data.established ? new Date(data.established) : null,
          employees: data.employees ? parseInt(data.employees) : null,
          capital: data.capital ? parseFloat(data.capital) : null,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          phone: data.phone,
          website: data.website,
          socialMedia: data.socialMedia,
          tags: data.tags || [],
          status: 'PENDING'
        }
      });

      // Tambahkan sebagai member (OWNER)
      await prisma.uMKMMember.create({
        data: {
          umkmId: umkm.id,
          userId,
          role: 'OWNER'
        }
      });

      return umkm;
    } catch (error) {
      console.error('Error registering UMKM:', error);
      throw error;
    }
  }

  // 2. Update UMKM
  async updateUMKM(userId, data) {
    try {
      const umkm = await prisma.uMKM.findUnique({
        where: { userId }
      });
      if (!umkm) {
        throw new Error('UMKM tidak ditemukan');
      }

      const updateData = {};
      if (data.name) {
        updateData.name = data.name;
        updateData.slug = slugify(data.name, { lower: true, strict: true });
      }
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type) updateData.type = data.type;
      if (data.category) updateData.category = data.category;
      if (data.established) updateData.established = new Date(data.established);
      if (data.employees) updateData.employees = parseInt(data.employees);
      if (data.capital) updateData.capital = parseFloat(data.capital);
      if (data.address !== undefined) updateData.address = data.address;
      if (data.city) updateData.city = data.city;
      if (data.province) updateData.province = data.province;
      if (data.postalCode) updateData.postalCode = data.postalCode;
      if (data.phone) updateData.phone = data.phone;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.socialMedia !== undefined) updateData.socialMedia = data.socialMedia;
      if (data.tags) updateData.tags = data.tags;
      if (data.logo !== undefined) updateData.logo = data.logo;
      if (data.banner !== undefined) updateData.banner = data.banner;

      return await prisma.uMKM.update({
        where: { userId },
        data: updateData,
        include: {
          user: { select: { name: true, email: true } },
          members: { include: { user: true } },
          certifications: true
        }
      });
    } catch (error) {
      console.error('Error updating UMKM:', error);
      throw error;
    }
  }

  // 3. Get UMKM by User ID
  async getUMKMByUserId(userId) {
    try {
      const umkm = await prisma.uMKM.findUnique({
        where: { userId },
        include: {
          user: { select: { name: true, email: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } }
            }
          },
          certifications: {
            orderBy: { createdAt: 'desc' }
          },
          products: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          partnerships1: {
            include: {
              umkm2: { select: { id: true, name: true, slug: true, logo: true } }
            }
          },
          partnerships2: {
            include: {
              umkm1: { select: { id: true, name: true, slug: true, logo: true } }
            }
          }
        }
      });

      if (!umkm) {
        return null;
      }

      // Hitung statistik tambahan
      const stats = await this.getUMKMStats(umkm.id);
      
      return {
        ...umkm,
        stats
      };
    } catch (error) {
      console.error('Error getting UMKM:', error);
      throw error;
    }
  }

  // 4. Get UMKM Stats
  async getUMKMStats(umkmId) {
    try {
      const [products, orders, reviews] = await Promise.all([
        prisma.product.count({ where: { storeId: umkmId } }),
        prisma.order.count({
          where: {
            items: {
              some: {
                product: { storeId: umkmId }
              }
            },
            status: 'DELIVERED'
          }
        }),
        prisma.review.count({
          where: {
            product: { storeId: umkmId }
          }
        })
      ]);

      const revenue = await prisma.order.aggregate({
        where: {
          items: {
            some: {
              product: { storeId: umkmId }
            }
          },
          status: 'DELIVERED'
        },
        _sum: {
          total: true
        }
      });

      return {
        totalProducts: products,
        totalOrders: orders,
        totalReviews: reviews,
        totalRevenue: revenue._sum.total || 0
      };
    } catch (error) {
      console.error('Error getting UMKM stats:', error);
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalReviews: 0,
        totalRevenue: 0
      };
    }
  }

  // 5. Get UMKM by Slug (Public)
  async getUMKMBySlug(slug) {
    try {
      const umkm = await prisma.uMKM.findUnique({
        where: { slug },
        include: {
          user: { select: { name: true, email: true } },
          products: {
            where: { stock: { gt: 0 } },
            include: {
              category: true
            },
            orderBy: { createdAt: 'desc' }
          },
          certifications: {
            where: { status: 'VERIFIED' }
          }
        }
      });

      if (!umkm) {
        throw new Error('UMKM tidak ditemukan');
      }

      return umkm;
    } catch (error) {
      console.error('Error getting UMKM by slug:', error);
      throw error;
    }
  }

  // 6. Search UMKM
  async searchUMKM(query, filters = {}, limit = 20) {
    try {
      const where = {
        status: 'VERIFIED'
      };

      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ];
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
      }

      const umkms = await prisma.uMKM.findMany({
        where,
        include: {
          user: { select: { name: true } },
          _count: {
            select: {
              products: true,
              members: true
            }
          }
        },
        orderBy: {
          rating: 'desc'
        },
        take: limit
      });

      return umkms;
    } catch (error) {
      console.error('Error searching UMKM:', error);
      throw error;
    }
  }

  // 7. Add UMKM Member
  async addMember(umkmId, userId, role = 'STAFF') {
    try {
      const existing = await prisma.uMKMMember.findUnique({
        where: {
          umkmId_userId: {
            umkmId,
            userId
          }
        }
      });

      if (existing) {
        throw new Error('User sudah menjadi member UMKM ini');
      }

      return await prisma.uMKMMember.create({
        data: {
          umkmId,
          userId,
          role
        },
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      });
    } catch (error) {
      console.error('Error adding UMKM member:', error);
      throw error;
    }
  }

  // 8. Add Certification
  async addCertification(umkmId, data) {
    try {
      return await prisma.certification.create({
        data: {
          umkmId,
          name: data.name,
          number: data.number,
          issuer: data.issuer,
          fileUrl: data.fileUrl,
          issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          status: 'PENDING'
        }
      });
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  }

  // 9. Verify UMKM (Admin only)
  async verifyUMKM(umkmId, adminId, status = 'VERIFIED') {
    try {
      return await prisma.uMKM.update({
        where: { id: umkmId },
        data: {
          status,
          verifiedAt: new Date(),
          verifiedBy: adminId
        }
      });
    } catch (error) {
      console.error('Error verifying UMKM:', error);
      throw error;
    }
  }
}

module.exports = new UMKMService();