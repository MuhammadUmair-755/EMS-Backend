const { Role, EmployeeStatus } = require("@prisma/client");
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const { validateEmployeeDates } = require("../utils/helpers/dateValidation");

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
      joiningDate,
    } = employeeData;
    if (!fullName?.trim()) throw new Error("Full Name is required.");
    if (!email?.trim()) throw new Error("Email address is required.");
    if (!password || password.length < 6)
      throw new Error("Password must be at least 6 characters.");
    if (!cnic?.trim()) throw new Error("CNIC is required.");
    if (!dob) throw new Error("Date of Birth is required.");
    if (!joiningDate) throw new Error("Joining Date is required.");
    if (!departmentId) throw new Error("Department selection is required.");
    if (!currentSalary || Number(currentSalary) <= 0)
      throw new Error("A valid salary greater than 0 is required.");
    if (!phone?.trim()) throw new Error("Phone number is required.");
    if (!address?.trim()) throw new Error("Home address is required.");
    if (!emergencyContact?.trim())
      throw new Error("Emergency contact is required.");
    if (!notes?.trim()) throw new Error("Notes cannot be empty.");

    validateEmployeeDates(dob);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please provide a valid email address.");
    }

    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;

    if (!cnicRegex.test(cnic)) {
      throw new Error("CNIC must be exactly 13 digits with dashes.");
    }
    if (currentSalary < 0) {
      throw new Error("Salary cannot be negative.");
    }
    const normalizedEmail = email.toLowerCase().trim();

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { cnic: cnic }],
      },
    });

    if (existingEmployee) {
      throw new Error("An employee with this Email or CNIC already exists.");
    }
    const normalizedRole =
      role?.toUpperCase() === "ADMIN" ? Role.ADMIN : Role.EMPLOYEE;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
      return await prisma.$transaction(async (tx) => {
        const lastEmployee = await tx.employee.findFirst({
          orderBy: { empCode: "desc" },
          select: { empCode: true },
        });
        let newEmpCode;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique) {
          if (attempts > 10) {
            throw new Error(
              "Could not generate a unique Employee Code. Please try again.",
            );
          }
          const randomNumber = Math.floor(100000 + Math.random() * 900000);
          newEmpCode = `EMP-${randomNumber}`;

          const existing = await tx.employee.findUnique({
            where: { empCode: newEmpCode },
            select: { id: true },
          });

          if (!existing) {
            isUnique = true;
          }
          attempts++;
        }
        const employee = await tx.employee.create({
          data: {
            empCode: newEmpCode,
            fullName,
            email: normalizedEmail,
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
            newValue: notes,
            adminUserId: adminId,
          },
        });

        return employee;
      });
    } catch (error) {
      if (error.code === "P2002") {
        const targets = error.meta?.target;
        const fieldName = Array.isArray(targets)
          ? targets.join(" or ")
          : "Email or CNIC";

        throw new Error(
          `An employee with this ${fieldName} already exists, possibly as a terminated record.`,
        );
      }
      throw error;
    }
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

  async getEmployeeByCode(empCode) {
    const normalizedCode = empCode.toUpperCase();
    const employee = await prisma.employee.findUnique({
      where: { empCode: normalizedCode },
      include: { department: true },
    });

    if (!employee)
      throw new Error(`Employee not found with this Code ${normalizedCode}`);

    return employee;
  }

  async updateEmployee(id, updateData, adminId) {
    const oldData = await this.getEmployeeById(id);
    validateEmployeeDates(updateData.dob);
    if (updateData?.status === "RESIGNED") {
      const headOfDepartment = await prisma.department.findFirst({
    where: { deptHeadId: id },
    select: { name: true }
  });

  if (headOfDepartment) {
    throw new Error(
      `This employee is the Head of the ${headOfDepartment.name} department. Please assign a new head before marking them as Resigned.`
    );
  }
    }
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...updateData,
        dob: updateData?.dob ? new Date(updateData?.dob) : undefined,
        joiningDate: updateData?.joiningDate
          ? new Date(updateData?.joiningDate)
          : undefined,
        currentSalary: updateData?.currentSalary
          ? parseFloat(updateData.currentSalary)
          : undefined,
      },
    });

    const logs = [];
    const fieldsToLog = [
      "currentSalary",
      "departmentId",
      "jobTitle",
      "status",
      "notes",
    ];

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

  async deleteEmployee(employeeId, adminId) {
    if (!employeeId) {
      throw new Error("Employee ID is required.");
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error("Employee not found.");
    }

    const leadingDepartment = await prisma.department.findFirst({
      where: { deptHeadId: employeeId },
    });

    if (leadingDepartment) {
      throw new Error(
        `Cannot terminate employee. They are currently the head of the ${leadingDepartment.name} department. Please reassign the department head first.`,
      );
    }

    return await prisma.$transaction(async (tx) => {
      const terminatedEmployee = await tx.employee.update({
        where: { id: employeeId },
        data: {
          status: "TERMINATED",
        },
      });
      await tx.employeeLog.create({
        data: {
          employeeId: employeeId,
          eventType: "Status_Change",
          oldValue: employee.status,
          newValue: "TERMINATED",
          adminUserId: adminId,
        },
      });
      return terminatedEmployee;
    });
  }

  async getEmployeeHistory(id) {
    return await prisma.employeeLog.findMany({
      where: { employeeId: id },
      orderBy: { date: "desc" },
    });
  }
}

module.exports = new EmployeeService();
