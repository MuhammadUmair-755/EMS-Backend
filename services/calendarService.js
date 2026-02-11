
const prisma = require("../config/prisma");

class CalendarService {
  async getCalendarEvents(filters = {}) {
    const { departmentId, type } = filters;
    let events = [];
    const currentYear = new Date().getFullYear();

    // 1. Fetch Approved Leaves
    if (!type || type === "leave") {
      const leaves = await prisma.leave.findMany({
        where: {
          status: "APPROVED", // Matches Enum in schema
          employee: departmentId ? { departmentId: departmentId } : {},
        },
        include: {
          employee: { select: { fullName: true } },
        },
      });

      leaves.forEach((leave) => {
        events.push({
          id: leave.id,
          title: `Leave: ${leave.employee.fullName}`,
          start: leave.startDate,
          end: leave.endDate,
          allDay: true,
          backgroundColor: "#f87171",
          extendedProps: { type: "leave", deptId: departmentId },
        });
      });
    }

    // 2. Fetch Birthdays
    if (!type || type === "birthday") {
      const employees = await prisma.employee.findMany({
        where: departmentId ? { departmentId: departmentId } : {},
        select: { id: true, fullName: true, dob: true },
      });

      employees.forEach((emp) => {
        const bday = new Date(emp.dob);
        const eventDate = new Date(currentYear, bday.getMonth(), bday.getDate());

        events.push({
          id: `bday-${emp.id}`,
          title: `🎂 ${emp.fullName}'s Birthday`,
          start: eventDate,
          allDay: true,
          backgroundColor: "#60a5fa",
          extendedProps: { type: "birthday" },
        });
      });
    }

    // 3. Department Head Birthdays
    if (!type || type === "head-birthday") {
      const departments = await prisma.department.findMany({
        where: departmentId ? { id: departmentId } : {},
        include: {
          deptHead: { select: { id: true, fullName: true, dob: true } },
        },
      });

      departments.forEach((dept) => {
        if (dept.deptHead) {
          const bday = new Date(dept.deptHead.dob);
          const eventDate = new Date(currentYear, bday.getMonth(), bday.getDate());

          events.push({
            id: `head-bday-${dept.id}`,
            title: `👑 Head Birthday: ${dept.deptHead.fullName} (${dept.name})`,
            start: eventDate,
            allDay: true,
            backgroundColor: "#8b5cf6",
            extendedProps: { type: "head-birthday", department: dept.name },
          });
        }
      });
    }

    return events;
  }
}

module.exports = new CalendarService();