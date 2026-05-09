const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendError } = require('../utils/api-response');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return sendError(res, 401, 'Authentication required', null, 'AUTH_REQUIRED');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id }).populate('station');

    if (!user) {
      return sendError(res, 401, 'Authentication failed', null, 'AUTH_FAILED');
    }

    req.user = user;
    req.station = user.station; // For backward compatibility with existing controllers
    req.token = token;
    next();
  } catch (error) {
    return sendError(res, 401, 'Authentication failed', null, 'AUTH_FAILED');
  }
};

module.exports = auth; 