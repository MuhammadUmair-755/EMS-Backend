const leaveService = require("../services/leaveService");

exports.requestLeave = async (req, res) => {
  try {
    const leaveData = { ...req.body, employeeId: req.user._id };
    const leave = await leaveService.createLeaveRequest(leaveData);

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.approveOrRejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    
    const updatedLeave = await leaveService.updateLeaveStatus(id, status);

    res.status(200).json({ success: true, data: updatedLeave });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getEmployeeLeaves(req.user._id);
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};