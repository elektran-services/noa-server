const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const {
  isProduction,
  corsOrigins,
  allowMaintenanceRoutes,
  swaggerEnabled,
} = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const connectDB = require('./config/database');
const { sendError } = require('./utils/api-response');
const logger = require('./config/logger');

// Import middleware
const errorHandler = require('./middleware/error.middleware');
const requestContext = require('./middleware/request-context.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const programRoutes = require('./routes/program.routes');
const oapRoutes = require('./routes/oap.routes');
const mediaRoutes = require('./routes/media.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const fixRoutes = require('./routes/fix.routes');

// Initialize express app
const app = express();

// Basic middleware
app.use(requestContext);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (!isProduction || corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy blocked this origin'));
  },
  credentials: true,
}));
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => sendError(
    res,
    429,
    'Too many requests. Please try again later.',
    null,
    'RATE_LIMITED'
  ),
});
app.use('/api', limiter);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Serve Swagger documentation (disabled in production by default)
if (swaggerEnabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Now On Air API Documentation'
  }));
}

// Routes with validation
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/oaps', oapRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/dashboard', dashboardRoutes);
if (allowMaintenanceRoutes) {
  app.use('/api/fix', fixRoutes);
}

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'noa-server',
    requestId: req.requestId,
    uptime: Math.round(process.uptime()),
  });
});

app.get('/health/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    return res.status(503).json({
      status: 'not_ready',
      requestId: req.requestId,
      db: 'disconnected',
    });
  }

  return res.status(200).json({
    status: 'ready',
    requestId: req.requestId,
    db: 'connected',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info('server.started', {
        port: PORT,
        swaggerEnabled,
      });
    });

    const shutdown = async (signal) => {
      logger.info('server.shutdown.begin', { signal });
      server.close(async () => {
        try {
          await mongoose.connection.close();
          logger.info('server.shutdown.complete', { signal });
          process.exit(0);
        } catch (error) {
          logger.error('server.shutdown.error', {
            signal,
            error: error.message,
          });
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('server.start.failed', { error: error.message });
    process.exit(1);
  }
};

// Start the server
startServer(); 