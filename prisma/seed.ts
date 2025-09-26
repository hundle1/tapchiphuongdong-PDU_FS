import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin user
  const hashedPassword = await bcrypt.hash('3101989adC@', 12);

  const superAdmin = await prisma.taiKhoanNguoiDung.upsert({
    where: { email: 'trexbairong@gmail.com' },
    update: {},
    create: {
      email: 'trexbairong@gmail.com',
      password: hashedPassword,
      name: 'Nguyễn Mạnh Dũng',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Created super admin:', superAdmin);

  // Create sample admin user
  const adminHashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.taiKhoanNguoiDung.upsert({
    where: { email: 'admin@tapchiphuongdong.com' },
    update: {},
    create: {
      email: 'admin@tapchiphuongdong.com',
      password: adminHashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('Created admin:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });