const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  try {
    // 1. Buat akun admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@desamart.com' },
      update: {},
      create: {
        name: 'Admin Desa',
        email: 'admin@desamart.com',
        password: adminPassword,
        role: 'ADMIN'
      }
    });
    console.log(`✅ Admin created: ${admin.email} (${admin.role})`);

    // 2. Buat akun seller
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const seller = await prisma.user.upsert({
      where: { email: 'seller@desamart.com' },
      update: {},
      create: {
        name: 'Toko Makmur',
        email: 'seller@desamart.com',
        password: sellerPassword,
        role: 'SELLER'
      }
    });
    console.log(`✅ Seller created: ${seller.email} (${seller.role})`);

    // 3. Buat akun buyer
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    const buyer = await prisma.user.upsert({
      where: { email: 'buyer@desamart.com' },
      update: {},
      create: {
        name: 'Budi Pembeli',
        email: 'buyer@desamart.com',
        password: buyerPassword,
        role: 'BUYER'
      }
    });
    console.log(`✅ Buyer created: ${buyer.email} (${buyer.role})`);

    // 4. Buat kategori (opsional)
    const categories = [
      { name: 'Makanan & Minuman' },
  { name: 'Fashion' },
  { name: 'Elektronik' },
  { name: 'Kerajinan' },
  { name: 'Pertanian' },
  { name: 'Kesehatan & Kecantikan' },
  { name: 'Peralatan Rumah Tangga' },
  { name: 'Otomotif' },
  { name: 'Lainnya' }
    ];

    for (const cat of categories) {
      const category = await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: {
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
        }
      });
      console.log(`✅ Category created: ${category.name}`);
    }

    await seedPayments();
    console.log('✅ Payment methods and bank accounts seeded');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Akun Demo:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMIN:');
    console.log('   📧 admin@desamart.com');
    console.log('   🔑 admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏪 SELLER:');
    console.log('   📧 seller@desamart.com');
    console.log('   🔑 seller123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 BUYER:');
    console.log('   📧 buyer@desamart.com');
    console.log('   🔑 buyer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
// Seed Payment Methods & Bank Accounts
async function seedPayments() {
  // Payment Methods
  const methods = [
    { name: 'BANK_TRANSFER', code: 'bank_transfer', description: 'Transfer Bank', isOnline: true, fee: 0 },
    { name: 'QRIS', code: 'qris', description: 'QR Code Payment', isOnline: true, fee: 0 },
    { name: 'COD', code: 'cod', description: 'Cash on Delivery', isOnline: false, fee: 5000 }
  ];

  for (const method of methods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: method,
      create: method
    });
  }

  // Bank Accounts
  const bankData = [
    { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DesaMart Official' },
    { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'DesaMart Official' },
    { bankName: 'BNI', accountNumber: '5678901234', accountHolder: 'DesaMart Official' },
    { bankName: 'BRI', accountNumber: '4321098765', accountHolder: 'DesaMart Official' }
  ];

  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { code: 'bank_transfer' }
  });

  if (paymentMethod) {
    for (const bank of bankData) {
      await prisma.bankAccount.upsert({
        where: { 
          accountNumber: bank.accountNumber 
        },
        update: { ...bank, paymentMethodId: paymentMethod.id },
        create: { ...bank, paymentMethodId: paymentMethod.id }
      });
    }
  }
}

main();