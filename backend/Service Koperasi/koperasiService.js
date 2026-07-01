const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

class KoperasiService {
  // ========== MANAJEMEN KOPERASI ==========
  async createKoperasi(adminId, data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    
    // Cek apakah user sudah punya koperasi
    const existing = await prisma.koperasi.findUnique({
      where: { adminId }
    });
    if (existing) throw new Error('Anda sudah memiliki koperasi');

    const koperasi = await prisma.koperasi.create({
      data: {
        ...data,
        slug,
        adminId,
        status: 'PENDING'
      }
    });

    // Tambahkan admin sebagai anggota dengan role KETUA
    await prisma.anggotaKoperasi.create({
      data: {
        userId: adminId,
        koperasiId: koperasi.id,
        role: 'KETUA',
        status: 'APPROVED',
        isActive: true
      }
    });

    return koperasi;
  }

  async getKoperasiByAdmin(adminId) {
    return await prisma.koperasi.findUnique({
      where: { adminId },
      include: {
        members: {
          include: { user: true }
        },
        products: true,
        _count: {
          select: { members: true, products: true, simpanan: true, pinjaman: true }
        }
      }
    });
  }

  async verifyKoperasi(koperasiId, status) {
    return await prisma.koperasi.update({
      where: { id: koperasiId },
      data: {
        status,
        isVerified: status === 'ACTIVE',
        verifiedAt: new Date()
      }
    });
  }

  // ========== MANAJEMEN ANGGOTA ==========
  async addMember(koperasiId, userId, role = 'ANGGOTA') {
    const existing = await prisma.anggotaKoperasi.findUnique({
      where: {
        userId_koperasiId: {
          userId,
          koperasiId
        }
      }
    });
    if (existing) throw new Error('User sudah menjadi anggota koperasi ini');

    return await prisma.anggotaKoperasi.create({
      data: {
        userId,
        koperasiId,
        role,
        status: 'PENDING'
      }
    });
  }

  async approveMember(anggotaId) {
    return await prisma.anggotaKoperasi.update({
      where: { id: anggotaId },
      data: {
        status: 'APPROVED',
        isActive: true,
        joinDate: new Date()
      }
    });
  }

  async getAnggotaKoperasi(koperasiId) {
    return await prisma.anggotaKoperasi.findMany({
      where: { koperasiId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  // ========== SIMPANAN ==========
  async createSimpanan(anggotaId, koperasiId, data) {
    const anggota = await prisma.anggotaKoperasi.findUnique({
      where: { id: anggotaId }
    });
    if (!anggota) throw new Error('Anggota tidak ditemukan');

    const simpanan = await prisma.simpanan.create({
      data: {
        anggotaId,
        koperasiId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        proof: data.proof
      }
    });

    // Update saldo anggota
    const fieldMap = {
      'POKOK': 'simpananPokok',
      'WAJIB': 'simpananWajib',
      'SUKARELA': 'simpananSukarela'
    };
    const field = fieldMap[data.type];
    await prisma.anggotaKoperasi.update({
      where: { id: anggotaId },
      data: {
        [field]: { increment: data.amount }
      }
    });

    return simpanan;
  }

  // ========== PINJAMAN ==========
  async createPinjaman(anggotaId, koperasiId, data) {
    const anggota = await prisma.anggotaKoperasi.findUnique({
      where: { id: anggotaId }
    });
    if (!anggota) throw new Error('Anggota tidak ditemukan');

    // Hitung angsuran
    const pokok = data.amount;
    const bunga = pokok * (data.interest / 100);
    const total = pokok + bunga;
    const angsuranPokok = pokok / data.period;
    const angsuranBunga = bunga / data.period;

    const pinjaman = await prisma.pinjaman.create({
      data: {
        anggotaId,
        koperasiId,
        amount: data.amount,
        interest: data.interest,
        period: data.period,
        purpose: data.purpose,
        document: data.document,
        angsuranPokok,
        angsuranBunga,
        totalAngsuran: angsuranPokok + angsuranBunga,
        sisaPinjaman: data.amount,
        status: 'PENDING'
      }
    });

    // Buat jadwal angsuran
    const angsurans = [];
    for (let i = 1; i <= data.period; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      angsurans.push({
        pinjamanId: pinjaman.id,
        angsuranKe: i,
        amount: angsuranPokok + angsuranBunga,
        dueDate
      });
    }
    await prisma.angsuranPinjaman.createMany({
      data: angsurans
    });

    return pinjaman;
  }

  async approvePinjaman(pinjamanId, adminId) {
    const pinjaman = await prisma.pinjaman.update({
      where: { id: pinjamanId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId
      }
    });
    return pinjaman;
  }

  async bayarAngsuran(angsuranId, proof) {
    const angsuran = await prisma.angsuranPinjaman.update({
      where: { id: angsuranId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        proof
      }
    });

    // Update sisa pinjaman
    const pinjaman = await prisma.pinjaman.findUnique({
      where: { id: angsuran.pinjamanId }
    });

    const sisaBaru = pinjaman.sisaPinjaman - angsuran.amount;
    const status = sisaBaru <= 0 ? 'PAID_OFF' : pinjaman.status;

    await prisma.pinjaman.update({
      where: { id: pinjaman.id },
      data: {
        sisaPinjaman: sisaBaru > 0 ? sisaBaru : 0,
        status,
        paidOffAt: sisaBaru <= 0 ? new Date() : null
      }
    });

    return angsuran;
  }

  // ========== PRODUK KOPERASI ==========
  async createProduct(koperasiId, data) {
    return await prisma.productKoperasi.create({
      data: {
        ...data,
        koperasiId
      }
    });
  }

  async getProducts(koperasiId) {
    return await prisma.productKoperasi.findMany({
      where: { koperasiId }
    });
  }

  // ========== TRANSAKSI ==========
  async transaksiPembelian(anggotaId, koperasiId, productId, quantity) {
    const product = await prisma.productKoperasi.findUnique({
      where: { id: productId }
    });
    if (!product) throw new Error('Produk tidak ditemukan');
    if (product.stock < quantity) throw new Error('Stok tidak mencukupi');

    const total = product.price * quantity;

    const transaksi = await prisma.transaksiKoperasi.create({
      data: {
        anggotaId,
        koperasiId,
        type: 'PEMBELIAN',
        amount: total,
        productId,
        description: `Pembelian ${product.name} x${quantity}`,
        status: 'CONFIRMED'
      }
    });

    // Update stok
    await prisma.productKoperasi.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    });

    return transaksi;
  }

  // ========== DASHBOARD ==========
  async getDashboard(koperasiId) {
    const [members, simpanan, pinjaman, transaksi, products] = await Promise.all([
      prisma.anggotaKoperasi.count({ where: { koperasiId, isActive: true } }),
      prisma.simpanan.aggregate({
        where: { koperasiId, status: 'CONFIRMED' },
        _sum: { amount: true }
      }),
      prisma.pinjaman.aggregate({
        where: { koperasiId, status: { in: ['APPROVED', 'DISBURSED'] } },
        _sum: { amount: true }
      }),
      prisma.transaksiKoperasi.aggregate({
        where: { koperasiId, status: 'CONFIRMED', type: 'PEMBELIAN' },
        _sum: { amount: true }
      }),
      prisma.productKoperasi.count({ where: { koperasiId } })
    ]);

    return {
      totalMembers: members,
      totalSimpanan: simpanan._sum.amount || 0,
      totalPinjaman: pinjaman._sum.amount || 0,
      totalTransaksi: transaksi._sum.amount || 0,
      totalProducts: products
    };
  }
}

module.exports = new KoperasiService();