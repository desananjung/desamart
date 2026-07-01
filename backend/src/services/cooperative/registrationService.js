const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class CooperativeRegistrationService {
  async registerCooperative(userId, data) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { cooperative: true }
      });

      if (!user) throw new Error('User tidak ditemukan');
      if (user.role !== 'ADMIN') {
        throw new Error('Hanya admin yang bisa mendaftarkan koperasi');
      }
      if (user.cooperative) {
        throw new Error('Admin sudah memiliki koperasi');
      }

      const slug = slugify(data.name, { lower: true, strict: true });
      const existing = await prisma.cooperative.findUnique({
        where: { slug }
      });
      if (existing) throw new Error('Nama koperasi sudah digunakan');

      const cooperative = await prisma.cooperative.create({
        data: {
          name: data.name,
          slug,
          type: data.type || 'KUD',
          description: data.description,
          registrationNumber: data.registrationNumber,
          establishmentDate: new Date(data.establishmentDate),
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          certificateUrl: data.certificateUrl,
          logo: data.logo,
          banner: data.banner,
          adminId: userId,
          status: 'PENDING'
        }
      });

      return cooperative;
    } catch (error) {
      throw error;
    }
  }

  async verifyCooperative(cooperativeId, status = 'ACTIVE') {
    const cooperative = await prisma.cooperative.update({
      where: { id: cooperativeId },
      data: {
        status,
        verifiedAt: new Date()
      }
    });
    return cooperative;
  }

  async getCooperativeStatus(userId) {
    const cooperative = await prisma.cooperative.findUnique({
      where: { adminId: userId },
      include: {
        members: {
          include: { user: true }
        },
        _count: {
          select: {
            members: true,
            products: true,
            loans: true,
            savings: true
          }
        }
      }
    });
    return cooperative;
  }
}

module.exports = new CooperativeRegistrationService();