const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true,
    unique: true
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Station = mongoose.model('Station', stationSchema);

module.exports = Station; 