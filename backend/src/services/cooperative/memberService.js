const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CooperativeMemberService {
  async addMember(cooperativeId, userId, role = 'MEMBER') {
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: cooperativeId }
    });
    if (!cooperative) throw new Error('Koperasi tidak ditemukan');

    const existing = await prisma.cooperativeMember.findFirst({
      where: { cooperativeId, userId }
    });
    if (existing) throw new Error('User sudah menjadi anggota');

    // Generate member number
    const count = await prisma.cooperativeMember.count({
      where: { cooperativeId }
    });
    const memberNumber = `KOP-${String(cooperativeId).padStart(3, '0')}-${String(count + 1).padStart(4, '0')}`;

    const member = await prisma.cooperativeMember.create({
      data: {
        cooperativeId,
        userId,
        memberNumber,
        role
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return member;
  }

  async getMembers(cooperativeId) {
    const members = await prisma.cooperativeMember.findMany({
      where: { cooperativeId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { joinDate: 'desc' }
    });
    return members;
  }

  async getMemberStats(memberId) {
    const member = await prisma.cooperativeMember.findUnique({
      where: { id: memberId },
      include: {
        savings: {
          orderBy: { transactionDate: 'desc' },
          take: 5
        },
        loans: {
          include: {
            payments: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!member) throw new Error('Anggota tidak ditemukan');

    // Hitung total simpanan
    const totalSavings = await prisma.cooperativeSavings.aggregate({
      where: { memberId },
      _sum: { amount: true }
    });

    // Hitung total pinjaman aktif
    const activeLoans = await prisma.cooperativeLoan.aggregate({
      where: {
        memberId,
        status: { in: ['ACTIVE', 'PENDING'] }
      },
      _sum: { remainingAmount: true }
    });

    return {
      ...member,
      totalSavings: totalSavings._sum.amount || 0,
      activeLoanAmount: activeLoans._sum.remainingAmount || 0
    };
  }
}

module.exports = new CooperativeMemberService();