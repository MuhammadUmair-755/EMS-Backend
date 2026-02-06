const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    cnic: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    joiningDate: { type: Date, required: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departments",
      required: false,
    },
    deptHead: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    currentSalary: { type: Number, required: true },
    jobTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Resigned", "Terminated"],
      default: "Active",
    },
    phone: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, 
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    }, // Add this    address: String,
    emergencyContact: String,
    notes: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", employeeSchema);
