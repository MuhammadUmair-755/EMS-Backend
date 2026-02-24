const departmentService = require("../services/departmentService");

exports.createDepartment = async (req, res) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.setDepartmentHead = async (req, res) => {
  try {
    const { deptId } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required to set a Department Head.",
      });
    }

    const updatedDept = await departmentService.setDepartmentHead(
      deptId,
      employeeId,
    );
    res.status(200).json({
      success: true,
      data: updatedDept,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const { departmentId } = req.query; // Extract from URL query string
    const result = await departmentService.getAllDepartments(departmentId);

    if (departmentId && !result) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      // If it's a single object, count is 1, otherwise it's the array length
      count: departmentId ? 1 : result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params; 
    const updateData = req.body; 

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided.",
      });
    }

    const updatedDept = await departmentService.updateDepartment(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDept,
    });
    
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }

   if (error.message.includes("head") || error.message.includes("exist")) {
      return res.status(400).json({ success: false, message: error.message });
    }
   if (error.message.includes("Resigned") || error.message.includes("Inactive") ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error("Update Department Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred while updating department.",
    });
  }
};