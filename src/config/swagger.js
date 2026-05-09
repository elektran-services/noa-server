const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Now On Air API',
      version: '1.0.0',
      description: 'API documentation for the Now On Air FM Radio Scheduling Platform',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@nowonair.com',
      },
    },
    servers: [
      {
        url: 'https://noa.elektranbroadcast.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Authentication failed'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Validation failed'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string'
                        },
                        message: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Resource not found'
                  }
                }
              }
            }
          }
        }
      },
      schemas: {
        Station: {
          type: 'object',
          required: ['stationName', 'frequency', 'userName', 'email', 'password'],
          properties: {
            stationName: { type: 'string', example: 'Cool FM' },
            frequency: { type: 'string', example: '96.9' },
            userName: { type: 'string', example: 'admin' },
            email: { type: 'string', format: 'email', example: 'admin@coolfm.com' },
            password: { type: 'string', format: 'password', example: 'securepassword' }
          }
        },
        Program: {
          type: 'object',
          required: ['programName', 'duration', 'days'],
          properties: {
            programName: { type: 'string', example: 'Morning Show' },
            duration: {
              type: 'object',
              properties: {
                start: { type: 'string', example: '06:00' },
                end: { type: 'string', example: '09:00' }
              }
            },
            programDetails: { type: 'string', example: 'Wake up with our energetic morning show!' },
            oaps: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016']
            },
            days: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              },
              example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            thumbnail: { type: 'string', example: '507f1f77bcf86cd799439011' }
          }
        },
        OAP: {
          type: 'object',
          required: ['oapName'],
          properties: {
            oapName: { type: 'string', example: 'John Doe' },
            realName: { type: 'string', example: 'Jonathan Doe' },
            profile: { type: 'string', example: 'Award-winning radio host with 10+ years of experience.' },
            programs: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
            },
            picture: { type: 'string', example: '507f1f77bcf86cd799439013' }
          }
        },
        OAPCreate: {
          type: 'object',
          required: ['oapName'],
          properties: {
            oapName: { type: 'string', example: 'John Doe' },
            realName: { type: 'string', example: 'Jonathan Doe' },
            profile: { type: 'string', example: 'Award-winning radio host with 10+ years of experience.' },
            picture: { type: 'string', example: '507f1f77bcf86cd799439013' }
          }
        },
        OAPUpdate: {
          type: 'object',
          properties: {
            oapName: { type: 'string', example: 'John Doe' },
            realName: { type: 'string', example: 'Jonathan Doe' },
            profile: { type: 'string', example: 'Award-winning radio host with 10+ years of experience.' },
            programs: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
            },
            picture: { type: 'string', example: '507f1f77bcf86cd799439013' }
          }
        },
        Media: {
          type: 'object',
          properties: {
            filename: { type: 'string', example: '1234567890-image.jpg' },
            originalname: { type: 'string', example: 'profile.jpg' },
            mimetype: { type: 'string', example: 'image/jpeg' },
            path: { type: 'string', example: '/uploads/1234567890-image.jpg' },
            size: { type: 'number', example: 1024576 }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            pages: { type: 'integer', example: 10 },
            limit: { type: 'integer', example: 10 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      },
      tags: [
        {
          name: 'Authentication',
          description: 'Station registration and authentication endpoints'
        },
        {
          name: 'Programs',
          description: 'Radio program management endpoints (GET endpoints are public, POST/PUT/DELETE require authentication)'
        },
        {
          name: 'OAPs',
          description: 'On-Air Personality management endpoints'
        },
        {
          name: 'Media',
          description: 'Media file management endpoints'
        },
        {
          name: 'Dashboard',
          description: 'Dashboard summary endpoints'
        }
      ]
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs; 