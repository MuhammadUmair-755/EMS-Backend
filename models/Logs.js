const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  eventType: {
    type: String,
    enum: [
      "Salary Increment",
      "Department Change",
      "Job Title Change",
      "Status Change",
      "Manual Note",
    ],
    required: true,
  },
  oldValue: String,
  newValue: String,
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who made the change
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EmployeeLog", logSchema);
