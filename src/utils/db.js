// src/utils/db.js
const mongoose = require('mongoose');

let isConnected = false;

console.log("process.env.MONGO_URI",process.env.MONGO_URI);
const connectDB = async () => {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  isConnected = true;
  console.log('✅ MongoDB connected');
};

module.exports = connectDB;
