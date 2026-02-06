const Leave = require("../models/Leaves.js");

class LeaveService {
  async createLeaveRequest(leaveData) {
    const { startDate, endDate, leaveType } = leaveData;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    if (start < today) {
      throw new Error("Start date cannot be in the past.");
    }

    if (end < start) {
      throw new Error("End date cannot be before the start date.");
    }

    const existingLeave = await Leave.findOne({
      employeeId: leaveData.employeeId,
      status: { $ne: "Rejected" },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (existingLeave) {
      throw new Error("You already have a leave request for these dates.");
    }

    return await Leave.create(leaveData);
  }

  async updateLeaveStatus(leaveId, status) {
    
    if (!["Approved", "Rejected"].includes(status)) {
      throw new Error("Invalid status update.");
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true, runValidators: true }
    );

    if (!leave) throw new Error("Leave request not found.");
    return leave;
  }

  async getEmployeeLeaves(employeeId) {
    return await Leave.find({ employeeId }).sort({ createdAt: -1 });
  }

  async getAllLeaves() {
    return await Leave.find().populate("employeeId", "fullName department").sort({ createdAt: -1 });
  }
}

module.exports = new LeaveService();