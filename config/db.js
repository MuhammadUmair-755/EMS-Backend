const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    // Use 127.0.0.1 to avoid the 'localhost' IPv6 vs IPv4 bug
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;