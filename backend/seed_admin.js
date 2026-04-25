require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${conn.connection.name}`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345678', salt);
    await User.create({
      name: 'System Admin',
      email: 'admin',
      password: hashedPassword,
      role: 'Admin'
    });

    console.log('Admin user forcefully created!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed DB:', error);
    process.exit(1);
  }
};

seedDB();
