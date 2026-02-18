const prisma = require("../config/prisma");

class DepartmentService {
  async createDepartment(deptData) {
    const { name, description } = deptData;

    if (!name || !description) {
      throw new Error("Enter valid department name and description");
    }

    // 1. Check if department name already exists using findUnique
    const existingDept = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDept) {
      throw new Error("Department with this name already exists.");
    }

    // 2. Create the department
    const department = await prisma.department.create({
      data: {
        name,
        description,
        deptHeadId: null, // Initialized as null
      },
    });

    return department;
  }

  async setDepartmentHead(deptId, employeeId) {
    if (!deptId || !employeeId) {
      throw new Error("Enter valid departmentId and employeeId");
    }

    try {
      const updatedDepartment = await prisma.department.update({
        where: { id: deptId },
        data: {
          deptHeadId: employeeId,
        },
        include: {
          deptHead: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      return updatedDepartment;
    } catch (error) {
      if (error.code === "P2025") {
        throw new Error("Department not found.");
      }
      throw error;
    }
  }

  async getAllDepartments(departmentId = null) {
    // If an ID is provided, fetch just one
    if (departmentId) {
      return await prisma.department.findUnique({
        where: { id: departmentId },
        include: {
          _count: { select: { employees: true } },
          // deptHead: { select: { fullName: true } }
          deptHead: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });
    }

    // Otherwise, fetch all (your existing logic)
    return await prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
        deptHead: { select: { fullName: true } },
      },
    });
  }

  async updateDepartment(deptId, updateData) {
    if (!deptId) {
      throw new Error("Department ID is required for update.");
    }

    // Destructure to ensure we only process the fields we allow
    const { name, description, deptHeadId } = updateData;

    try {
      const updatedDepartment = await prisma.department.update({
        where: { id: deptId },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          deptHeadId: deptHeadId !== undefined ? deptHeadId : undefined,
        },
        include: {
          deptHead: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      return updatedDepartment;
    } catch (error) {
      // P2025 is Prisma's error for "Record to update not found."
      if (error.code === "P2025") {
        throw new Error("Department not found.");
      }
      // P2003 is a Foreign Key constraint error (e.g., employeeId doesn't exist)
      if (error.code === "P2003") {
        throw new Error(
          "The selected Department Head (Employee ID) does not exist.",
        );
      }
      throw error;
    }
  }
}

module.exports = new DepartmentService();
