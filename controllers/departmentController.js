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
    const departments = await departmentService.getAllDepartments();
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
