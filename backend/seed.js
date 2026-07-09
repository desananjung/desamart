// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// ============================================
// SEED CATEGORIES
// ============================================
async function seedCategories() {
  console.log('📂 Creating categories...');
  const categories = [
    'Makanan & Minuman',
    'Fashion',
    'Elektronik',
    'Kerajinan',
    'Pertanian',
    'Kesehatan & Kecantikan',
    'Peralatan Rumah Tangga',
    'Otomotif',
    'Lainnya'
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
      }
    });
  }
  console.log(`✅ ${categories.length} categories created`);
}

// ============================================
// SEED USERS
// ============================================
async function seedUsers() {
  console.log('👑 Creating users...');

  // Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@desamart.com' },
    update: {},
    create: {
      name: 'Admin Desa',
      email: 'admin@desamart.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin created');

  // Seller
  const sellerPassword = await bcrypt.hash('seller123', 10);
  await prisma.user.upsert({
    where: { email: 'seller@desamart.com' },
    update: {},
    create: {
      name: 'Toko Makmur',
      email: 'seller@desamart.com',
      password: sellerPassword,
      role: 'SELLER'
    }
  });
  console.log('✅ Seller created');

  // Buyer
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  await prisma.user.upsert({
    where: { email: 'buyer@desamart.com' },
    update: {},
    create: {
      name: 'Budi Pembeli',
      email: 'buyer@desamart.com',
      password: buyerPassword,
      role: 'BUYER'
    }
  });
  console.log('✅ Buyer created');
}

// ============================================
// SEED PAYMENT METHODS
// ============================================
async function seedPayments() {
  console.log('💳 Creating payment methods...');

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
  console.log('✅ Payment methods created');

  // Bank Accounts
  console.log('🏦 Creating bank accounts...');
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
        where: { accountNumber: bank.accountNumber },
        update: { ...bank, paymentMethodId: paymentMethod.id },
        create: { ...bank, paymentMethodId: paymentMethod.id }
      });
    }
    console.log('✅ Bank accounts created');
  }
}

// ============================================
// SEED VILLAGE COURIERS
// ============================================
async function seedCouriers() {
  console.log('🚚 Creating village couriers...');

  const couriers = [
    {
      name: 'Pak Ahmad',
      phone: '08123456789',
      vehicleType: 'MOTOR',
      village: 'Desa Sukamakmur',
      pricePerKm: 5000,
      isActive: true,
      isVerified: true,
      available: true,
      rating: 4.8,
      totalDeliveries: 150,
    },
    {
      name: 'Bu Siti',
      phone: '08198765432',
      vehicleType: 'MOBIL',
      village: 'Desa Sukamakmur',
      pricePerKm: 8000,
      isActive: true,
      isVerified: true,
      available: true,
      rating: 4.9,
      totalDeliveries: 230,
    },
    {
      name: 'Mas Budi',
      phone: '08134567890',
      vehicleType: 'SEPEDA',
      village: 'Desa Sukamakmur',
      pricePerKm: 3000,
      isActive: true,
      isVerified: false,
      available: true,
      rating: 4.5,
      totalDeliveries: 45,
    },
  ];

  for (const courier of couriers) {
    const existing = await prisma.villageCourier.findFirst({
      where: { phone: courier.phone }
    });

    if (existing) {
      await prisma.villageCourier.update({
        where: { id: existing.id },
        data: courier,
      });
      console.log(`  ✏️ Updated: ${courier.name}`);
    } else {
      await prisma.villageCourier.create({
        data: courier,
      });
      console.log(`  ✅ Created: ${courier.name}`);
    }
  }

  console.log('✅ Village couriers seeded!');
}

// ============================================
// UPDATE PRODUCT SELLER (Opsional)
// ============================================
async function updateProductSeller() {
  try {
    const product = await prisma.product.findFirst({
      where: { name: 'kue' }
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { sellerId: 2 }
      });
      console.log('✅ Product sellerId updated to 2');
    } else {
      console.log('ℹ️ No product found to update');
    }
  } catch (error) {
    console.log('ℹ️ Update product seller skipped:', error.message);
  }
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🌱 Starting seeding...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    await seedUsers();
    await seedCategories();
    await seedPayments();
    await seedCouriers();
    await updateProductSeller();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    console.log('\n📂 Categories:');
    console.log('   ✅ Makanan & Minuman');
    console.log('   ✅ Fashion');
    console.log('   ✅ Elektronik');
    console.log('   ✅ Kerajinan');
    console.log('   ✅ Pertanian');
    console.log('   ✅ Kesehatan & Kecantikan');
    console.log('   ✅ Peralatan Rumah Tangga');
    console.log('   ✅ Otomotif');
    console.log('   ✅ Lainnya');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// RUN
// ============================================
main();