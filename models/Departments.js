const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  deptHead: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Departments", departmentSchema);