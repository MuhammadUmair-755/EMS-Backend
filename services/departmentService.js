const prisma = require("../config/prisma");

class DepartmentService {
  async createDepartment(deptData) {
    const { name, description } = deptData;

    if (!name || typeof name !== "string") {
      throw new Error("Enter valid department name");
    }

    if (!description || description.trim() === "") {
      throw new Error("Enter valid department description");
    }
    const normalizedName = name.toUpperCase();
    // 1. Check if department name already exists using findUnique
    const existingDept = await prisma.department.findUnique({
      where: { name: normalizedName },
    });

    if (existingDept) {
      throw new Error("Department with this name already exists.");
    }

    // 2. Create the department
    const department = await prisma.department.create({
      data: {
        name: normalizedName,
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

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error("Employee does not exist.");
    }

    const existingHeadship = await prisma.department.findFirst({
      where: {
        deptHeadId: employeeId,
        NOT: {
          id: deptId, // Allow if they are already the head of THIS department
        },
      },
    });

    if (existingHeadship) {
      throw new Error(
        `This employee is already the head of the ${existingHeadship.name} department.`,
      );
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
              empCode: true,
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
              empCode: true,
            },
          },
        },
      });
    }

    // Otherwise, fetch all (your existing logic)
    return await prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
        deptHead: { select: { fullName: true, empCode: true } },
      },
    });
  }

  async updateDepartment(deptId, updateData) {
    if (!deptId) {
      throw new Error("Department ID is required for update.");
    }

    const { name, description, deptHeadId } = updateData;

    if (deptHeadId) {
      const employee = await prisma.employee.findUnique({
        where: { id: deptHeadId },
        select: { id: true, departmentId: true, status: true },
      });

      if (!employee) {
        throw new Error("Employee does not exist.");
      }
      if (employee.status !== "ACTIVE") {
        throw new Error(
          "Cannot set a Resigned or Inactive employee as Department Head.",
        );
      }

      if (employee.departmentId !== deptId) {
        throw new Error(
          "Cannot set this employee as head; they belong to a different department.",
        );
      }

      const existingHeadship = await prisma.department.findFirst({
        where: {
          deptHeadId: deptHeadId,
          NOT: { id: deptId },
        },
      });

      if (existingHeadship) {
        throw new Error(
          `This employee is already the head of the ${existingHeadship.name} department.`,
        );
      }
    }

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
              empCode: true,
            },
          },
        },
      });

      return updatedDepartment;
    } catch (error) {
      if (error.code === "P2025") {
        throw new Error("Department not found.");
      }
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
