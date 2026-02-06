const express = require("express");
const router = express.Router();
const { requestLeave, approveOrRejectLeave, getMyLeaves } = require("../controllers/leaveController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/request", protect, requestLeave);
router.get("/my-leaves", protect, getMyLeaves);

router.put("/:id/status", protect, adminOnly, approveOrRejectLeave);

module.exports = router;