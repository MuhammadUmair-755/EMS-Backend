const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, cnic, dob, joiningDate, department, currentSalary, jobTitle, role } = req.body;

    const employeeExists = await Employee.findOne({ $or: [{ email }, { cnic }] });
    if (employeeExists) {
      return res.status(400).json({ message: "Employee with this email or CNIC already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = await Employee.create({
      fullName,
      email,
      password: hashedPassword,
      cnic,
      dob,
      joiningDate,
      department,
      currentSalary,
      jobTitle,
      role: role || "employee", 
    });

    res.status(201).json({
      _id: employee._id,
      fullName: employee.fullName,
      role: employee.role,
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: employee._id,
      fullName: employee.fullName,
      role: employee.role, 
      token: generateToken(employee._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};