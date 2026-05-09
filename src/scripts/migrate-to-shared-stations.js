const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Station = require('../models/station.model');
const User = require('../models/user.model');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Migration function
const migrateToSharedStations = async () => {
  try {
    console.log('Starting migration to shared station system...');

    // Get all existing stations (old format)
    const oldStations = await mongoose.connection.db.collection('stations').find({}).toArray();
    console.log(`Found ${oldStations.length} existing stations to migrate`);

    for (const oldStation of oldStations) {
      console.log(`Migrating station: ${oldStation.stationName}`);

      // Create new station record (without user data)
      const newStation = new Station({
        stationName: oldStation.stationName,
        frequency: oldStation.frequency,
        description: `Migrated from old system`,
        isActive: true
      });

      await newStation.save();

      // Create user record from old station data
      const user = new User({
        userName: oldStation.userName,
        email: oldStation.email,
        password: oldStation.password, // Keep existing password
        station: newStation._id,
        role: 'admin' // First user becomes admin
      });

      await user.save();

      console.log(`✅ Migrated: ${oldStation.stationName} → User: ${user.userName}`);
    }

    console.log('Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test registration with a new user for existing station');
    console.log('2. Test login with existing credentials');
    console.log('3. Verify public endpoints still work');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration
connectDB().then(() => {
  migrateToSharedStations();
});
