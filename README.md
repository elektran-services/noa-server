# Now On Air - FM Radio Scheduling Platform

A robust backend API for FM radio stations to manage their daily broadcast schedules, programs, and on-air personalities.

## Quick Start

1. First, install all dependencies:
```bash
cd noa-server
npm install
```

2. Create a `.env` file in the noa-server directory with your MongoDB connection string and other configurations:
```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=2097152
CORS_ORIGIN=http://localhost:3000
TRUST_PROXY=false
SWAGGER_ENABLED=true
LOG_LEVEL=info
ALLOW_MAINTENANCE_ROUTES=false
MAINTENANCE_TOKEN=replace_with_maintenance_token_if_enabled
```

3. Create the uploads directory for media storage:
```bash
mkdir uploads
```

4. Start the development server:
```bash
npm run dev
```

The server will start and you should see these messages:
- "Connected to MongoDB"
- "Server is running on port 5000"
- "Liveness probe available at http://localhost:5000/health/live"
- "Readiness probe available at http://localhost:5000/health/ready"

You can then:

1. Visit http://localhost:5000/api-docs to see the interactive API documentation
2. Test the API endpoints:
   - Register a new station
   - Login to get your JWT token
   - Use the token to access protected endpoints

Would you like me to:
1. Create some example data to test with?
2. Show you how to test specific endpoints?
3. Add any development tools or scripts to make development easier?

Let me know what would be most helpful!

## API Documentation

Once the server is running, you can access the interactive API documentation at:
http://localhost:5000/api-docs

The Swagger UI provides detailed documentation for all endpoints, including:
- Authentication endpoints
- Program management
- OAP (On-Air Personality) management
- Media upload and management
- Real-time "Now On Air" and "Up Next" information

In production, Swagger is disabled by default unless `SWAGGER_ENABLED=true`.

## Testing the API

1. **Register a Station**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "stationName": "Cool FM",
    "frequency": "96.9",
    "userName": "admin",
    "email": "admin@coolfm.com",
    "password": "securepassword"
  }'
```

2. **Login to Get Token**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@coolfm.com",
    "password": "securepassword"
  }'
```

3. **Create a Program** (Use token from login)
```bash
curl -X POST http://localhost:5000/api/programs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programName": "Morning Show",
    "duration": {
      "start": "06:00",
      "end": "09:00"
    },
    "programDetails": "Wake up with our energetic morning show!",
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }'
```

## Project Structure

```
noa-server/
├── src/
│   ├── config/
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── media.controller.js
│   │   ├── oap.controller.js
│   │   └── program.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   ├── models/
│   │   ├── media.model.js
│   │   ├── oap.model.js
│   │   ├── program.model.js
│   │   └── station.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── media.routes.js
│   │   ├── oap.routes.js
│   │   └── program.routes.js
│   └── index.js
├── uploads/          # Media storage directory
├── .env             # Environment variables
├── .env.example     # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Features

- 📻 Station Registration and Authentication
- 📋 Program Schedule Management
- 👥 On-Air Personality (OAP) Management
- 🖼️ Media Upload and Management
- 🕒 Real-time "Now On Air" and "Up Next" Information
- 📅 Day-wise Program Scheduling
- 🔒 Secure Authentication with JWT
- ⚡ Rate Limiting for API Protection
- 📄 Interactive API Documentation
- 🔍 Search and Filtering
- 📱 Pagination Support

## API Features

### Authentication
- JWT-based authentication
- Secure password hashing
- Session management

### Programs
- Create and manage radio programs
- Schedule programs by day and time
- Get currently airing program
- Get upcoming program
- Search and filter programs

### OAPs (On-Air Personalities)
- Manage radio presenters
- Associate OAPs with programs
- Profile picture management
- Search OAPs by name
- Pagination support

### Media Management
- Upload images (JPG, PNG, WebP)
- Automatic file validation
- Secure file storage
- File type filtering
- Pagination support

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- File upload errors
- Database errors
- Not found errors

Error responses follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": null
  }
}
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Stricter rate limiting on authentication endpoints
- File upload validation
- CORS protection
- Helmet security headers
- Request IDs on all responses (`x-request-id`)
- Structured request and server logs via Winston

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests
npm test
```

## Production Deployment

1. Set production environment variables
2. Build the project (if needed)
3. Start the server
```bash
npm start
```

### Production Environment Notes

- Set `NODE_ENV=production`.
- Set `CORS_ORIGIN` to a comma-separated list of trusted frontend origins.
- Set `TRUST_PROXY` when running behind reverse proxies/load balancers (for accurate client IP and rate limiting).
- Keep `SWAGGER_ENABLED=false` unless explicitly needed.
- Set `LOG_LEVEL` (`info`, `warn`, `error`) per environment.
- Keep `ALLOW_MAINTENANCE_ROUTES=false` by default in production.
- If maintenance routes must be enabled temporarily, set `ALLOW_MAINTENANCE_ROUTES=true` and require `MAINTENANCE_TOKEN`.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[MIT License](LICENSE) 