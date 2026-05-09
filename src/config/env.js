const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');

if (!fs.existsSync(envPath)) {
  console.error('.env file not found at:', envPath);
  console.error('Please create .env file with required environment variables');
  process.exit(1);
}

dotenv.config({ path: envPath });

const configureDnsFromEnv = require('./configure-dns');
configureDnsFromEnv();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && corsOrigins.length === 0) {
  console.error('Error: CORS_ORIGIN is required in production');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 16) {
  console.error('Error: JWT_SECRET must be at least 16 characters long');
  process.exit(1);
}

const parseBool = (value, fallback = false) => {
  if (typeof value !== 'string') return fallback;
  return value.trim().toLowerCase() === 'true';
};

module.exports = {
  isProduction,
  corsOrigins,
  allowMaintenanceRoutes: parseBool(process.env.ALLOW_MAINTENANCE_ROUTES, false),
  maintenanceToken: process.env.MAINTENANCE_TOKEN || '',
  swaggerEnabled: parseBool(process.env.SWAGGER_ENABLED, !isProduction),
};
