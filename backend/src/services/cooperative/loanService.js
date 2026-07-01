const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CooperativeLoanService {
  async requestLoan(memberId, data) {
    const member = await prisma.cooperativeMember.findUnique({
      where: { id: memberId }
    });
    if (!member) throw new Error('Anggota tidak ditemukan');

    // Hitung installment per bulan
    const monthlyInstallment = data.amount / data.tenure;
    const totalInterest = data.amount * (data.interestRate / 100) * data.tenure;
    const totalAmount = data.amount + totalInterest;

    const loan = await prisma.cooperativeLoan.create({
      data: {
        memberId,
        amount: data.amount,
        interestRate: data.interestRate || 0,
        tenure: data.tenure,
        purpose: data.purpose,
        dueDate: new Date(Date.now() + data.tenure * 30 * 24 * 60 * 60 * 1000),
        installmentAmount: monthlyInstallment,
        remainingAmount: totalAmount,
        status: 'PENDING'
      },
      include: {
        member: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return loan;
  }

  async approveLoan(loanId) {
    const loan = await prisma.cooperativeLoan.update({
      where: { id: loanId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      },
      include: {
        member: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    return loan;
  }

  async disburseLoan(loanId) {
    const loan = await prisma.cooperativeLoan.update({
      where: { id: loanId },
      data: {
        status: 'ACTIVE',
        disbursedAt: new Date()
      }
    });

    return loan;
  }

  async makePayment(loanId, amount) {
    const loan = await prisma.cooperativeLoan.findUnique({
      where: { id: loanId }
    });
    if (!loan) throw new Error('Pinjaman tidak ditemukan');

    // Hitung pembayaran (principal + interest)
    const principalPayment = amount * 0.8;
    const interestPayment = amount * 0.2;

    const payment = await prisma.cooperativeLoanPayment.create({
      data: {
        loanId,
        amount,
        principal: principalPayment,
        interest: interestPayment
      }
    });

    // Update remaining amount
    const newRemaining = loan.remainingAmount - amount;
    const status = newRemaining <= 0 ? 'PAID' : 'ACTIVE';

    await prisma.cooperativeLoan.update({
      where: { id: loanId },
      data: {
        paidAmount: { increment: amount },
        remainingAmount: newRemaining,
        status
      }
    });

    return payment;
  }

  async getLoans(cooperativeId, status = null) {
    const where = { member: { cooperativeId } };
    if (status) where.status = status;

    const loans = await prisma.cooperativeLoan.findMany({
      where,
      include: {
        member: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return loans;
  }
}

module.exports = new CooperativeLoanService();