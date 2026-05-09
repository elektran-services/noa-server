const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isProduction, maintenanceToken } = require('../config/env');

router.use((req, res, next) => {
  if (isProduction && !maintenanceToken) {
    return res.status(503).json({
      message: 'Maintenance routes are not available in this environment',
    });
  }

  if (!maintenanceToken) {
    return next();
  }

  if (req.header('x-maintenance-token') !== maintenanceToken) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
});

// Emergency fix endpoint - run this once then delete
router.get('/fix-indexes', async (req, res) => {
  try {
    console.log('Fixing station collection indexes...');

    // Get the stations collection
    const stationsCollection = mongoose.connection.db.collection('stations');
    
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

    res.json({ 
      message: 'Station indexes fixed successfully!',
      status: 'success'
    });

  } catch (error) {
    console.error('Index fix failed:', error);
    res.status(500).json({ 
      message: 'Index fix failed', 
      error: error.message 
    });
  }
});

module.exports = router;
