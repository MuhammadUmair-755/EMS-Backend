const calendarService = require("../services/calendarService");

exports.getCalendar = async (req, res) => {
  try {
    const events = await calendarService.getCalendarEvents(req.query);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};