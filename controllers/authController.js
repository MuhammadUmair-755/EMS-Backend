require('dotenv').config(); 
// const { PrismaClient } = require('@prisma/client');
// const { Pool } = require('pg');
// const { PrismaPg } =require('@prisma/adapter-pg');
// const connectionString = `${process.env.DATABASE_URL}`;
// const pool = new Pool ({connectionString});
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({adapter});
const prisma = require('../config/prisma');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
exports.register = async (req, res) => {
  try {
    const { 
      email, password, fullName, cnic, dob, 
      joiningDate, currentSalary, jobTitle, role, departmentId 
    } = req.body;

    // 1. Check if employee already exists (Email or CNIC)
    const employeeExists = await prisma.employee.findFirst({
      where: {
        OR: [{ email }, { cnic }]
      }
    });

    if (employeeExists) {
      return res.status(400).json({ message: "Employee with this email or CNIC already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Employee
    // Note: Dates must be converted to ISO format for Postgres
    const employee = await prisma.employee.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        cnic,
        dob: new Date(dob),
        joiningDate: new Date(joiningDate),
        currentSalary: parseFloat(currentSalary),
        jobTitle,
        role: role || "EMPLOYEE", // Match Enum case in schema
        departmentId: departmentId || null
      }
    });

    res.status(201).json({
      _id: employee.id,
      fullName: employee.fullName,
      role: employee.role,
      token: generateToken(employee.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const employee = await prisma.employee.findUnique({
      where: { email }
    });

    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: employee.id,
      fullName: employee.fullName,
      role: employee.role,
      token: generateToken(employee.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};