require('dotenv').config();
const mongoose = require('mongoose');

const clearDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to: ${conn.connection.name}`);
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped completely.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  }
};

clearDB();
