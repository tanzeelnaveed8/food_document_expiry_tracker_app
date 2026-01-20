import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      isVerified: true,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create notification preferences for test user
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      enabled: true,
      intervals: [30, 15, 7, 1],
    },
  });

  console.log('✅ Created notification preferences');

  // Create test food items
  const foodItems = await prisma.foodItem.createMany({
    data: [
      {
        userId: user.id,
        name: 'Milk',
        category: 'DAIRY',
        storageType: 'REFRIGERATOR',
        expiryDate: new Date('2026-01-25'),
        status: 'EXPIRING_SOON',
        quantity: '1 liter',
      },
      {
        userId: user.id,
        name: 'Chicken Breast',
        category: 'MEAT',
        storageType: 'FREEZER',
        expiryDate: new Date('2026-02-15'),
        status: 'SAFE',
        quantity: '500g',
      },
      {
        userId: user.id,
        name: 'Apples',
        category: 'FRUITS',
        storageType: 'REFRIGERATOR',
        expiryDate: new Date('2026-01-20'),
        status: 'EXPIRING_SOON',
        quantity: '6 pieces',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${foodItems.count} food items`);

  // Create test documents
  const documents = await prisma.document.createMany({
    data: [
      {
        userId: user.id,
        name: 'Passport',
        type: 'PASSPORT',
        documentNumber: 'AB1234567',
        expiryDate: new Date('2028-06-15'),
        status: 'SAFE',
      },
      {
        userId: user.id,
        name: 'Driver License',
        type: 'DRIVERS_LICENSE',
        documentNumber: 'DL987654',
        expiryDate: new Date('2026-03-20'),
        status: 'SAFE',
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${documents.count} documents`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
