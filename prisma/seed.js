require('dotenv').config(); // This loads your .env variables
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
async function main() {
  console.log('Seeding database...');

  // 1. Hash the password for the Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 2. Create the HR Department first
  const hrDept = await prisma.department.upsert({
    where: { name: 'HR' },
    update: {},
    create: {
      name: 'HR',
      description: 'Human Resources and Recruitment',
    },
  });

  // 3. Create the Admin Employee and link them to HR as a member
  const admin = await prisma.employee.upsert({
    where: { email: 'admin@ems.com' },
    update: {},
    create: {
      fullName: 'System Administrator',
      email: 'admin@ems.com',
      password: hashedPassword,
      cnic: '42101-1234567-1',
      dob: new Date('1990-01-01'),
      joiningDate: new Date(),
      currentSalary: 75000,
      jobTitle: 'HR Manager',
      role: 'ADMIN', // Matches your Enum
      status: 'ACTIVE', // Matches your Enum
      departmentId: hrDept.id, // Linking to HR department
    },
  });

  // 4. Set the Admin as the Head of the HR Department
  await prisma.department.update({
    where: { id: hrDept.id },
    data: {
      deptHeadId: admin.id,
    },
  });

  console.log('✅ Success: HR Department created.');
  console.log(`✅ Success: Admin (${admin.email}) created and set as Head of HR.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });