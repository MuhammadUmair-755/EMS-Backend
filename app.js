const express = require('express');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
require('dotenv').config();
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const departmentRoutes = require("./routes/departmentRoutes");
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

connectDB();    
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ngrok-skip-browser-warning',
    'Accept'
  ],
  credentials: true,
};

// This applies CORS to all routes and handles OPTIONS automatically
app.use(cors(corsOptions));

// If you still feel you need an explicit OPTIONS handler, use the (.*) syntax:
app.options('(.*)', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/departments", departmentRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});