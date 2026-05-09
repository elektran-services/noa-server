const mongoose = require('mongoose');

const oapSchema = new mongoose.Schema({
  oapName: {
    type: String,
    required: [true, 'OAP name is required'],
    trim: true
  },
  realName: {
    type: String,
    trim: true
  },
  profile: {
    type: String,
    trim: true
  },
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  }],
  picture: {
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
oapSchema.index({ station: 1 });

const OAP = mongoose.model('OAP', oapSchema);

module.exports = OAP; 