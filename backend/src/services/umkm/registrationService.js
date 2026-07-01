const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class UMKMRegistrationService {
  async registerUMKM(userId, data) {
    try {
      // Cek user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          store: true, 
          umkm: true,
          // Perbaiki: pastikan relasi ke umkm benar
        }
      });

      if (!user) throw new Error('User tidak ditemukan');
      if (user.role !== 'SELLER') {
        throw new Error('Hanya seller yang bisa mendaftar UMKM');
      }
      if (user.umkm) {
        throw new Error('User sudah terdaftar sebagai UMKM');
      }

      // Buat atau update store
      let store = user.store;
      if (!store) {
        const slug = slugify(data.name, { lower: true, strict: true });
        store = await prisma.store.create({
          data: {
            name: data.name,
            slug,
            address: data.address,
            phone: data.phone,
            sellerId: userId
          }
        });
      }

      // Buat UMKM - Pastikan menggunakan model yang benar (UMKM)
      const umkm = await prisma.uMKM.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          subCategory: data.subCategory,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          socialMedia: data.socialMedia,
          businessLicense: data.businessLicense,
          idCard: data.idCard,
          photo: data.photo,
          userId,
          storeId: store.id,
          status: 'PENDING'
        }
      });

      return umkm;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async verifyUMKM(umkmId, adminId, status = 'APPROVED') {
    try {
      const umkm = await prisma.uMKM.update({
        where: { id: umkmId },
        data: {
          status,
          isVerified: status === 'APPROVED',
          verifiedAt: new Date(),
          verifiedBy: adminId
        }
      });
      return umkm;
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    }
  }

  async getUMKMStatus(userId) {
    try {
      // Perbaiki: gunakan uMKM (huruf besar M) sesuai schema
      const umkm = await prisma.uMKM.findUnique({
        where: { userId },
        include: {
          store: true,
          products: {
            include: { product: true }
          }
        }
      });
      return umkm;
    } catch (error) {
      console.error('Get UMKM status error:', error);
      return null;
    }
  }
}

module.exports = new UMKMRegistrationService();