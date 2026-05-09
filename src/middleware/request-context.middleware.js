const crypto = require('crypto');
const logger = require('../config/logger');

const requestContext = (req, res, next) => {
  const requestId = req.header('x-request-id') || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const startTime = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('request.completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.get('user-agent') || null,
      stationId: req.station ? req.station._id : null,
      userId: req.user ? req.user._id : null,
    });
  });

  next();
};

module.exports = requestContext;
