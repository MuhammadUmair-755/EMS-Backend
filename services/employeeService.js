const Employee = require("../models/Employee");
const EmployeeLog = require("../models/Logs");
const bcrypt = require("bcryptjs");

class EmployeeService {
  async createEmployee(employeeData, adminId) {
    const { fullName, email, cnic, currentSalary, dob, password } =
      employeeData;

    if (!fullName || !email || !cnic || !currentSalary || !password) {
      throw new Error(
        "Missing required fields: fullName, email, cnic, password and currentSalary are mandatory.",
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format.");
    }

    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!cnicRegex.test(cnic)) {
      throw new Error("Invalid CNIC format. Expected: 00000-0000000-0");
    }

    if (isNaN(currentSalary) || currentSalary <= 0) {
      throw new Error("Current salary must be a positive number.");
    }

    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();

      if (isNaN(birthDate.getTime())) {
        throw new Error("Invalid Date of Birth format.");
      }

      if (birthDate >= today) {
        throw new Error("Date of Birth cannot be today or in the future.");
      }

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        throw new Error("Employee must be at least 18 years old.");
      }
    } else {
      throw new Error("Date of Birth is required.");
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { cnic }],
    });

    if (existingEmployee) {
      throw new Error("An employee with this Email or CNIC already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const finalData = {
      ...employeeData,
      password: hashedPassword,
      joiningDate: employeeData.joiningDate || new Date(),
    };

    const employee = await Employee.create(finalData);

    await EmployeeLog.create({
      employeeId: employee._id,
      eventType: "Manual Note",
      newValue: "Employee profile created",
      adminUser: adminId,
    });

    return employee;
  }

  async getEmployees(query = {}) {
    const employees = await Employee.find(query)
    .populate("department", "name")
    .select("-password")
    .sort({ createdAt: -1 });
    return employees;
    // return await Employee.find().populate("deptHead", "fullname");
  }

  async getEmployeeById(id) {
    if (!id) throw new Error("Invalid Id");
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  }

  async updateEmployee(id, updateData, adminId) {
    if (!id) throw new Error("Invalid Id");
    const { email, cnic, currentSalary, dob } = updateData;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("Invalid email format.");

      const existing = await Employee.findOne({ email, _id: { $ne: id } });
      if (existing)
        throw new Error("Email is already in use by another employee.");
    }

    if (cnic) {
      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (!cnicRegex.test(cnic)) throw new Error("Invalid CNIC format.");

      const existing = await Employee.findOne({ cnic, _id: { $ne: id } });
      if (existing)
        throw new Error("CNIC is already in use by another employee.");
    }

    if (currentSalary !== undefined) {
      if (isNaN(currentSalary) || currentSalary < 0) {
        throw new Error("Salary must be a positive number.");
      }
    }

    if (dob) {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime()) || birthDate >= new Date()) {
        throw new Error("Invalid Date of Birth.");
      }
    }

    const oldData = await Employee.findById(id);
    if (!oldData) throw new Error("Employee not found");

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (
      updateData.currentSalary &&
      oldData.currentSalary !== updateData.currentSalary
    ) {
      await EmployeeLog.create({
        employeeId: id,
        eventType: "Salary Increment",
        oldValue: oldData.currentSalary.toString(),
        newValue: updateData.currentSalary.toString(),
        adminUser: adminId,
      });
    }

    if (updateData.department && oldData.department !== updateData.department) {
      await EmployeeLog.create({
        employeeId: id,
        eventType: "Department Change",
        oldValue: oldData.department,
        newValue: updateData.department,
        adminUser: adminId,
      });
    }
    if (updateData.jobTitle && oldData.jobTitle !== updateData.jobTitle) {
      console.log(oldData.jobTitle, updateData.jobTitle);
      await EmployeeLog.create({
        employeeId: id,
        eventType: "Job Title Change",
        oldValue: oldData.jobTitle,
        newValue: updateData.jobTitle,
        adminUser: adminId,
      });
    }

    if (updateData.status && oldData.status !== updateData.status) {
      await EmployeeLog.create({
        employeeId: id,
        eventType: "Status Change",
        oldValue: oldData.status,
        newValue: updateData.status,
        adminUser: adminId,
      });
    }
    if (updateData.notes && oldData.notes !== updateData.notes) {
      await EmployeeLog.create({
        employeeId: id,
        eventType: "Manual Note",
        oldValue: oldData.notes,
        newValue: updateData.status,
        adminUser: adminId,
      });
    }

    return updatedEmployee;
  }

  async deleteEmployee(id) {
    if (!id) throw new Error("Invalid Id");
    return await Employee.findByIdAndDelete(id);
  }

  async getEmployeeHistory(id) {
    if (!id) {
      throw new Error("Invalid Id");
    }
    const employee = await this.getEmployeeById(id);
    if (!employee) {
      throw new Error("Employee not found with id");
    }
    const logs = await EmployeeLog.find({ employeeId: id }).sort({
      createdAt: -1,
    });

    return logs;
  }
}

module.exports = new EmployeeService();
