const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error('MongoDB connection error: Could not reach the database server');
    } else if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('MongoDB connection error: Wrong database name in the connection string');
    } else if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('MongoDB connection error: Authentication failed - wrong username or password');
      console.error('Please check your credentials in the MONGODB_URI');
    } else {
      console.error('MongoDB connection error:', error.message);
    }
    process.exit(1);
  }
};

module.exports = connectDB; 