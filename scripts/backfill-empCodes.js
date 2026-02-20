const prisma = require("../config/prisma");


async function backfill() {
  console.log("Starting backfill of Employee Codes...");

  // Get all employees who don't have an empCode, ordered by their creation
  const employees = await prisma.employee.findMany({
    where: { empCode: null },
    orderBy: { createdAt: 'asc' }
  });

  if (employees.length === 0) {
    console.log("No employees found without codes.");
    return;
  }

  for (let i = 0; i < employees.length; i++) {
    const code = `EMP-${1001 + i}`;
    
    await prisma.employee.update({
      where: { id: employees[i].id },
      data: { empCode: code }
    });

    console.log(`Updated ${employees[i].fullName} with code ${code}`);
  }

  console.log("Backfill complete!");
}

backfill()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());