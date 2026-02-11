const leaveService = require("../services/leaveService");

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaves();

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
      error: error.message,
    });
  }
};

exports.requestLeave = async (req, res) => {
  try {
    const leaveData = req.body;
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

exports.getLeavesByEmployeeId = async (req, res) => {
  try {
    const leaves = await leaveService.getEmployeeLeaves(req.id);
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getDeptLeaves = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    const leaves = await leaveService.getDepartmentLeavesByMonth(departmentId);
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching department leaves",
      error: error.message,
    });
  }
};
