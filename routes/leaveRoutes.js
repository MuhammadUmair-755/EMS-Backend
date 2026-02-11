const express = require("express");
const router = express.Router();
const {
  requestLeave,
  approveOrRejectLeave,
  getLeavesByEmployeeId,
  getAllLeaves,
  getDeptLeaves,
} = require("../controllers/leaveController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/request", protect, adminOnly, requestLeave);
router.get("/", protect, adminOnly, getAllLeaves).get("/department/:departmentId", protect, adminOnly, getDeptLeaves);
router.put("/:id/status", protect, adminOnly, approveOrRejectLeave);
router.get("/:id",protect, adminOnly, getLeavesByEmployeeId);

module.exports = router;
