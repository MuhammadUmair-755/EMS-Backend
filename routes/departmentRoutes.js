const express = require("express");
const router = express.Router();

const {
  createDepartment,
  setDepartmentHead,
  getAllDepartments,
} = require("../controllers/departmentController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, adminOnly, createDepartment)
  .get(protect, adminOnly, getAllDepartments);

router.route("/:deptId/head").patch(protect, adminOnly, setDepartmentHead);

module.exports = router;
