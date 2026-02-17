const { Role, EmployeeStatus } = require("@prisma/client");
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

class EmployeeService {
  async createEmployee(employeeData, adminId) {
    const {
      fullName,
      email,
      cnic,
      currentSalary,
      dob,
      password,
      departmentId,
      role,
      phone,
      address,
      emergencyContact,
      notes,
    } = employeeData;

    if (
      !fullName ||
      !email ||
      !cnic ||
      !currentSalary ||
      !password ||
      !dob ||
      !departmentId
    ) {
      throw new Error("Missing required fields.");
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address.");
    }

    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

    if (!cnicRegex.test(cnic)) {
      throw new Error("CNIC must be exactly 13 digits with dashes.");
    }
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ email }, { cnic }],
      },
    });
    const normalizedRole =
      role?.toUpperCase() === "ADMIN" ? Role.ADMIN : Role.EMPLOYEE;

    if (existingEmployee) {
      throw new Error("An employee with this Email or CNIC already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return await prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          fullName,
          email,
          cnic,
          currentSalary: parseFloat(currentSalary),
          dob: new Date(dob),
          password: hashedPassword,
          jobTitle: employeeData.jobTitle,
          status:
            employeeData.status === "RESIGNED"
              ? EmployeeStatus.RESIGNED
              : employeeData.status === "TERMINATED"
                ? EmployeeStatus.TERMINATED
                : EmployeeStatus.ACTIVE,
          role: normalizedRole,
          joiningDate: employeeData.joiningDate
            ? new Date(employeeData.joiningDate)
            : new Date(),
          departmentId: departmentId,
          phone: phone,
          emergencyContact: emergencyContact,
          address: address,
          notes: notes,
        },
      });

      await tx.employeeLog.create({
        data: {
          employeeId: employee.id,
          eventType: "Manual_Note", // Matches the Enum in your Prisma schema
          newValue: "Employee profile created",
          adminUserId: adminId,
        },
      });

      return employee;
    });
  }

  async getEmployees(filters = {}) {
    return await prisma.employee.findMany({
      where: filters,
      include: {
        department: { select: { name: true } }, // Replaces .populate()
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getEmployeeById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!employee) throw new Error("Employee not found");
    return employee;
  }

  async updateEmployee(id, updateData, adminId) {
    const oldData = await this.getEmployeeById(id);

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        dob: updateData.dob ? new Date(updateData.dob) : undefined,
        currentSalary: updateData.currentSalary
          ? parseFloat(updateData.currentSalary)
          : undefined,
      },
    });

    const logs = [];
    const fieldsToLog = ["currentSalary", "departmentId", "jobTitle", "status"];

    fieldsToLog.forEach((field) => {
      if (updateData[field] && oldData[field] !== updateData[field]) {
        logs.push({
          employeeId: id,
          eventType: this._mapFieldToEventType(field),
          oldValue: oldData[field]?.toString(),
          newValue: updateData[field]?.toString(),
          adminUserId: adminId,
        });
      }
    });

    if (logs.length > 0) {
      await prisma.employeeLog.createMany({ data: logs });
    }

    return updatedEmployee;
  }

  _mapFieldToEventType(field) {
    const maps = {
      currentSalary: "Salary_Increment",
      departmentId: "Department_Change",
      jobTitle: "Job_Title_Change",
      status: "Status_Change",
    };
    return maps[field] || "Manual_Note";
  }

  async deleteEmployee(id) {
    return await prisma.employee.delete({ where: { id } });
  }

  async getEmployeeHistory(id) {
    return await prisma.employeeLog.findMany({
      where: { employeeId: id },
      orderBy: { date: "desc" },
    });
  }
}

module.exports = new EmployeeService();
