const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  programName: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true
  },
  duration: {
    start: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    },
    end: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)']
    }
  },
  programDetails: {
    type: String,
    trim: true
  },
  oaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OAP'
  }],
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  thumbnail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
programSchema.index({ station: 1, 'duration.start': 1 });
programSchema.index({ days: 1 });

const Program = mongoose.model('Program', programSchema);

module.exports = Program; 