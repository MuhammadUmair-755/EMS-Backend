const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} = require("../controllers/employeeController");
const { getEmployeeHistory } = require("../controllers/employeeLogsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// router.use(protect);
router
  .route("/")
  .post(protect, adminOnly, createEmployee)
  .get(protect, adminOnly,getEmployees);
router
  .route("/:id")
  .put(protect, adminOnly, updateEmployee)
  .delete(protect, adminOnly, deleteEmployee)
  .get(protect, adminOnly, getEmployeeById);
router.route("/:id/history").get(protect, adminOnly, getEmployeeHistory);

module.exports = router;
