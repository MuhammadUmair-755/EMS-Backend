const express = require("express");
const authRoutes = require("./routes/authRoutes");
// const connectDB = require('./config/db');
require("dotenv").config();
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

// connectDB();
app.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://uneversible-hypsometrically-hoyt.ngrok-free.dev",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  // allowedHeaders: [
  //   'Content-Type',
  //   'Authorization',
  //   'ngrok-skip-browser-warning',
  //   'Accept'
  // ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/calendar", calendarRoutes);

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
module.exports = app;