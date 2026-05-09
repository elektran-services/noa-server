const jwt = require('jsonwebtoken');
const Station = require('../models/station.model');
const User = require('../models/user.model');

// Register new user for a station
exports.register = async (req, res) => {
  try {
    const { stationName, frequency, userName, email, password } = req.body;

    console.log('Registration attempt:', { stationName, userName, email });

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Find or create station
    let station = await Station.findOne({ stationName: stationName.trim() });
    
    if (!station) {
      // Create new station if it doesn't exist
      console.log('Creating new station:', stationName);
      station = new Station({
        stationName: stationName.trim(),
        frequency
      });
      await station.save();
      console.log('Station created:', station._id);
    } else {
      console.log('Using existing station:', station._id);
    }

    // Create new user associated with the station
    const user = new User({
      userName,
      email,
      password,
      station: station._id,
      role: 'admin' // First user becomes admin
    });

    await user.save();
    console.log('User created:', user._id);

    // Populate station data
    await user.populate('station');

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, stationId: station._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      },
      station: {
        id: station._id,
        stationName: station.stationName,
        frequency: station.frequency
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });

    // Find user by email and populate station
    const user = await User.findOne({ email }).populate('station');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for:', email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, stationId: user.station._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      },
      station: {
        id: user.station._id,
        stationName: user.station.stationName,
        frequency: user.station.frequency
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role
      },
      station: {
        id: user.station._id,
        stationName: user.station.stationName,
        frequency: user.station.frequency
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
}; 