const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Function to test environment setup
const testSetup = async () => {
  console.log('Testing environment setup...\n');

  // 1. Check .env file
  const envPath = path.resolve(__dirname, '../../.env');
  console.log('Looking for .env file at:', envPath);
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    return false;
  }
  console.log('✅ .env file found');

  // 2. Load environment variables
  dotenv.config({ path: envPath });
  
  // 3. Check required variables
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  console.log('\nChecking environment variables:');
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ ${varName} is not defined in .env`);
      return false;
    }
    console.log(`✅ ${varName} is defined`);
  }

  // 4. Validate MongoDB URI format
  console.log('\nValidating MongoDB URI format...');
  const uri = process.env.MONGODB_URI;
  if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
    console.error('❌ MongoDB URI must start with mongodb+srv:// or mongodb://');
    return false;
  }
  console.log('✅ MongoDB URI format is valid');

  // 5. Test MongoDB connection
  console.log('\nTesting MongoDB connection...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB at:', conn.connection.host);
    await mongoose.disconnect();
    console.log('✅ Successfully disconnected from MongoDB');
    return true;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error('❌ Could not reach the database server. Please check:');
      console.error('  - Your internet connection');
      console.error('  - The hostname in your MongoDB URI');
    } else if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('❌ Wrong database name in the connection string');
    } else if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('❌ Authentication failed - wrong username or password');
      console.error('Please check your credentials in the MONGODB_URI');
      console.error('Make sure special characters in the password are properly URL encoded');
    } else {
      console.error('❌ MongoDB connection failed:', error.message);
    }
    return false;
  }
};

// Run the test
testSetup()
  .then(success => {
    if (success) {
      console.log('\n✅ All tests passed! You can now start the server.');
    } else {
      console.log('\n❌ Some tests failed. Please fix the issues above before starting the server.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  }); 