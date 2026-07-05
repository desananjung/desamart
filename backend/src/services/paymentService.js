const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentService {
  async getPaymentMethods() {
    try {
      const methods = await prisma.paymentMethod.findMany({
        where: { isActive: true },
        include: {
          bankAccounts: {
            where: { isActive: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      return methods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  async getBankAccounts() {
    try {
      const accounts = await prisma.bankAccount.findMany({
        where: { isActive: true },
        include: {
          paymentMethod: {
            select: { name: true, code: true }
          }
        },
        orderBy: { bankName: 'asc' }
      });
      return accounts;
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }
  }

  async processPayment(orderId, userId, methodCode, bankAccountId) {
    try {
      // Cek order
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { items: true }
      });

      if (!order) throw new Error('Pesanan tidak ditemukan');
      if (order.userId !== userId) throw new Error('Anda tidak memiliki akses ke pesanan ini');
      if (order.status !== 'PENDING') throw new Error('Pesanan sudah diproses');

      // Cek metode pembayaran
      const method = await prisma.paymentMethod.findUnique({
        where: { code: methodCode }
      });

      if (!method) throw new Error('Metode pembayaran tidak ditemukan');

      // Proses berdasarkan metode
      let paymentStatus = 'PENDING';
      let paymentData = {};

      if (methodCode === 'bank_transfer') {
        if (!bankAccountId) throw new Error('Pilih rekening tujuan');
        
        const bank = await prisma.bankAccount.findUnique({
          where: { id: parseInt(bankAccountId) }
        });
        if (!bank) throw new Error('Rekening tidak ditemukan');
        
        paymentData = {
          bankName: bank.bankName,
          accountNumber: bank.accountNumber,
          accountHolder: bank.accountHolder
        };
      } else if (methodCode === 'qris') {
        paymentData = {
          qrCode: `QR-${Date.now()}-${order.id}`,
          qrString: `https://qris.example.com/${order.id}`
        };
      } else if (methodCode === 'cod') {
        paymentData = {
          codAmount: order.total,
          codStatus: 'WAITING_DELIVERY'
        };
      }

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          paymentMethod: methodCode,
          paymentStatus: paymentStatus,
          paymentProof: paymentData.qrCode || null
        },
        include: {
          items: {
            include: { product: { select: { name: true, imageUrl: true } } }
          },
          user: { select: { name: true, email: true } }
        }
      });

      // Simpan transaksi pembayaran
      await prisma.payment.create({
        data: {
          orderId: parseInt(orderId),
          userId: userId,
          method: methodCode,
          amount: order.total,
          status: paymentStatus,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 jam
        }
      });

      return updatedOrder;
    } catch (error) {
      console.error('Payment process error:', error);
      throw error;
    }
  }

  async confirmPayment(orderId, userId, proofImage) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) }
      });

      if (!order) throw new Error('Pesanan tidak ditemukan');
      if (order.userId !== userId) throw new Error('Anda tidak memiliki akses');

      const updatedOrder = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          paymentStatus: 'PAID',
          paidAt: new Date(),
          paymentProof: proofImage,
          status: 'PROCESSING'
        }
      });

      return updatedOrder;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();