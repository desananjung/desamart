const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPayments() {
  try {
    console.log('🌱 Seeding payment methods...');

    // 1. Payment Methods
    const methods = [
      { name: 'BANK_TRANSFER', code: 'bank_transfer', description: 'Transfer Bank', isOnline: true, fee: 0 },
      { name: 'QRIS', code: 'qris', description: 'QR Code Payment', isOnline: true, fee: 0 },
      { name: 'COD', code: 'cod', description: 'Cash on Delivery', isOnline: false, fee: 5000 }
    ];

    for (const method of methods) {
      const existing = await prisma.paymentMethod.findUnique({
        where: { code: method.code }
      });
      
      if (existing) {
        console.log(`⏭️ ${method.name} already exists, skipping...`);
        continue;
      }
      
      await prisma.paymentMethod.create({
        data: method
      });
      console.log(`✅ ${method.name} seeded`);
    }

    // 2. Get payment method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { code: 'bank_transfer' }
    });

    if (!paymentMethod) {
      console.log('❌ Payment method BANK_TRANSFER not found');
      return;
    }

    console.log(`✅ Found payment method: ${paymentMethod.name} (ID: ${paymentMethod.id})`);

    // 3. Bank Accounts
    const banks = [
      { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DesaMart Official' },
      { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'DesaMart Official' },
      { bankName: 'BNI', accountNumber: '5678901234', accountHolder: 'DesaMart Official' },
      { bankName: 'BRI', accountNumber: '4321098765', accountHolder: 'DesaMart Official' }
    ];

    for (const bank of banks) {
      // Cek apakah sudah ada
      const existing = await prisma.bankAccount.findFirst({
        where: {
          accountNumber: bank.accountNumber,
          paymentMethodId: paymentMethod.id
        }
      });
      
      if (existing) {
        console.log(`⏭️ ${bank.bankName} account already exists, skipping...`);
        continue;
      }
      
      await prisma.bankAccount.create({
        data: {
          ...bank,
          paymentMethodId: paymentMethod.id
        }
      });
      console.log(`✅ ${bank.bankName} account seeded`);
    }

    console.log('✅ Payment methods seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPayments();