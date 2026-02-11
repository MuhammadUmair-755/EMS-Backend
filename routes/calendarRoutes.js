const express = require("express");
const router = express.Router();

const { getCalendar } = require("../controllers/calendarController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
router.route("/").get(protect, adminOnly, getCalendar);

module.exports = router;
