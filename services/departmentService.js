const Department = require("../models/Departments");

class DepartmentService {
  async createDepartment(deptData) {
    const { name, description } = deptData;
    if (!name || !description) {
      throw new Error("Enter valid department name and description");
    }
    // Check if department name already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      throw new Error("Department with this name already exists.");
    }

    const department = await Department.create({
      name,
      description,
      deptHead: null,
    });

    return department;
  }

  async setDepartmentHead(deptId, employeeId) {
    if (!deptId || !employeeId) {
      throw new Error("Enter valid departmentId and employeeId");
    }

    const department = await Department.findById(deptId);

    if (!department) {
      throw new Error("Department not found.");
    }

    department.deptHead = employeeId;
    await department.save();

    return await Department.findById(deptId).populate(
      "deptHead",
      "fullName email",
    );
  }
  
  async getAllDepartments() {
    console.log("req arrived");
    const departments = await Department.find();
    return departments;
  }
}

module.exports = new DepartmentService();
