const express = require("express");
const router = express.Router();

const {
  createDepartment,
  setDepartmentHead,
  getAllDepartments,
  updateDepartment,
} = require("../controllers/departmentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, adminOnly, getAllDepartments)
  .post(protect, adminOnly, createDepartment);
router.route("/:id").put(protect, adminOnly, updateDepartment);
router.route("/:deptId/head").put(protect, adminOnly, setDepartmentHead);

module.exports = router;
