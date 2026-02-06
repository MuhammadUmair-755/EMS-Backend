const Employee = require("../models/Employee");
const employeeService = require("../services/employeeService");

exports.createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(
      req.body,
      req.user._id,
    );
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { department } = req.query;
    query = {};
    if (department) {
      query.department = department;
    }
    const employees = await employeeService.getEmployees(query);
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);
    res.status(200).json({ success: true, employee: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.user._id,
    );
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
