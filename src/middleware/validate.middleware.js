const Joi = require('joi');
const { sendError } = require('../utils/api-response');

// Validation schemas
const schemas = {
  // Auth validation schemas
  register: Joi.object({
    stationName: Joi.string().required().trim(),
    frequency: Joi.string().required().trim(),
    userName: Joi.string().required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(8).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),

  // Program validation schemas
  program: Joi.object({
    programName: Joi.string().required().trim(),
    duration: Joi.object({
      start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    }).required(),
    programDetails: Joi.string().trim(),
    oaps: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    ),
    days: Joi.array().items(
      Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
    ).min(1).required(),
    thumbnail: Joi.string().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
  }),

  // OAP validation schemas
  oapCreate: Joi.object({
    oapName: Joi.string().required().trim(),
    realName: Joi.string().trim(),
    profile: Joi.string().trim(),
    picture: Joi.string().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
  }),

  oapUpdate: Joi.object({
    oapName: Joi.string().trim(),
    realName: Joi.string().trim(),
    profile: Joi.string().trim(),
    programs: Joi.array().items(
      Joi.string().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
    ),
    picture: Joi.string().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return sendError(res, 400, 'Validation failed', errors, 'VALIDATION_ERROR');
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
}; 