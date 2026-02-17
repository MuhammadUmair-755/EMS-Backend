const prisma = require("../config/prisma");

class LeaveService {
  async createLeaveRequest(leaveData) {
    const { startDate, endDate, leaveType, employeeId, reason } = leaveData;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error("Employee not found with Id");
    }

    // 1. Date Validations
    if (start < today) {
      throw new Error("Start date cannot be in the past.");
    }

    if (end < start) {
      throw new Error("End date cannot be before the start date.");
    }

    const existingLeave = await prisma.leave.findFirst({
      where: {
        employeeId: employeeId,
        status: { not: "REJECTED" },
        AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
      },
    });

    if (existingLeave) {
      throw new Error("You already have a leave request for these dates.");
    }

    // 3. Create Leave
    return await prisma.leave.create({
      data: {
        employeeId,
        startDate: start,
        endDate: end,
        leaveType: leaveType.toUpperCase(),
        reason,
        status: "PENDING",
      },
    });
  }

  async updateLeaveStatus(leaveId, status) {
    // Validating against expected Enum strings
    const upperStatus = status.toUpperCase();
    if (!["APPROVED", "REJECTED"].includes(upperStatus)) {
      throw new Error("Invalid status update.");
    }

    try {
      const leave = await prisma.leave.update({
        where: { id: leaveId },
        data: { status: upperStatus },
      });
      return leave;
    } catch (error) {
      if (error.code === "P2025") throw new Error("Leave request not found.");
      throw error;
    }
  }

  async getEmployeeLeaves(employeeId) {
    return await prisma.leave.findMany({
      where: { employeeId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllLeaves() {
    return await prisma.leave.findMany({
      include: {
        employee: {
          select: {
            fullName: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getDepartmentLeavesByMonth(departmentId) {
    const now = new Date();

    const startOfMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0),
    );
    const endOfMonth = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    );

    const leaves = await prisma.leave.findMany({
      where: {
        employee: {
          departmentId: departmentId,
        },

        // AND: [
        //   {
        //     startDate: { lte: endOfMonth },
        //   },
        //   {
        //     endDate: { gte: startOfMonth },
        //   },
        // ],
      },
      include: {
        employee: {
          select: {
            fullName: true,
            jobTitle: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });
    return leaves;
  }
}

module.exports = new LeaveService();
