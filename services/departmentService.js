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
      if (error.code === 'P2025') {
        throw new Error("Department not found.");
      }
      throw error;
    }
  }

  async getAllDepartments() {
    
    return await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true } 
        },
        deptHead: {
          select: { fullName: true }
        }
      }
    });
  }
}

module.exports = new DepartmentService();