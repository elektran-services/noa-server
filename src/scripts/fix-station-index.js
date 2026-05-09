const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for index fix');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Fix the station collection indexes
const fixStationIndexes = async () => {
  try {
    console.log('Fixing station collection indexes...');

    // Get the stations collection
    const stationsCollection = mongoose.connection.db.collection('stations');
    
    // List current indexes
    console.log('Current indexes:');
    const indexes = await stationsCollection.indexes();
    indexes.forEach(index => {
      console.log('-', JSON.stringify(index.key), JSON.stringify(index));
    });

    // Drop the email index if it exists
    try {
      await stationsCollection.dropIndex('email_1');
      console.log('✅ Dropped email_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  email_1 index does not exist (already dropped)');
      } else {
        console.log('❌ Error dropping email_1 index:', error.message);
      }
    }

    // Create new indexes for the new schema
    try {
      await stationsCollection.createIndex({ stationName: 1 }, { unique: true });
      console.log('✅ Created stationName unique index');
    } catch (error) {
      console.log('❌ Error creating stationName index:', error.message);
    }

    // List final indexes
    console.log('\nFinal indexes:');
    const finalIndexes = await stationsCollection.indexes();
    finalIndexes.forEach(index => {
      console.log('-', JSON.stringify(index.key), JSON.stringify(index));
    });

    console.log('\n✅ Station indexes fixed successfully!');
    console.log('You can now restart your server and try registration again.');

  } catch (error) {
    console.error('Index fix failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the fix
connectDB().then(() => {
  fixStationIndexes();
});
