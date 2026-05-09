const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');
const auth = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

// Public GET endpoints - No authentication required
/**
 * @swagger
 * /api/programs/now-on-air:
 *   get:
 *     summary: Get currently airing program (Public endpoint)
 *     tags: [Programs]
 *     parameters:
 *       - in: query
 *         name: stationName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the station
 *         example: "Cool FM"
 *     responses:
 *       200:
 *         description: Currently airing program
 *       400:
 *         description: Station name is required
 *       404:
 *         description: Station not found
 */
router.get('/now-on-air', programController.getNowOnAir);

/**
 * @swagger
 * /api/programs/now-and-next:
 *   get:
 *     summary: Get combined Now On Air and Up Next summary (Public endpoint)
 *     tags: [Programs]
 *     parameters:
 *       - in: query
 *         name: stationName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the station
 *         example: "Cool FM"
 *     responses:
 *       200:
 *         description: Combined summary
 *       400:
 *         description: Station name is required
 *       404:
 *         description: Station not found
 */
router.get('/now-and-next', programController.getNowAndNextSummary);

/**
 * @swagger
 * /api/programs/up-next:
 *   get:
 *     summary: Get next scheduled program (Public endpoint)
 *     tags: [Programs]
 *     parameters:
 *       - in: query
 *         name: stationName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the station
 *         example: "Cool FM"
 *     responses:
 *       200:
 *         description: Next scheduled program
 *       400:
 *         description: Station name is required
 *       404:
 *         description: Station not found
 */
router.get('/up-next', programController.getUpNext);

/**
 * @swagger
 * /api/programs/day/{day}:
 *   get:
 *     summary: Get programs for a specific day (Public endpoint)
 *     tags: [Programs]
 *     parameters:
 *       - in: path
 *         name: day
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *       - in: query
 *         name: stationName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the station
 *         example: "Cool FM"
 *     responses:
 *       200:
 *         description: List of programs for the specified day
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Station not found
 */
router.get('/day/:day', programController.getProgramsByDay);

/**
 * @swagger
 * /api/programs:
 *   get:
 *     summary: Get all programs for the station (Public endpoint)
 *     tags: [Programs]
 *     parameters:
 *       - in: query
 *         name: stationName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the station
 *         example: "Cool FM"
 *     responses:
 *       200:
 *         description: List of programs
 *       400:
 *         description: Station name is required
 *       404:
 *         description: Station not found
 */
router.get('/', programController.getPrograms);

// Protected routes - Authentication required for write operations
/**
 * @swagger
 * /api/programs:
 *   post:
 *     summary: Create a new program
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Program'
 *     responses:
 *       201:
 *         description: Program created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/', auth, validate(schemas.program), programController.createProgram);

/**
 * @swagger
 * /api/programs/{id}:
 *   put:
 *     summary: Update a program
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Program'
 *     responses:
 *       200:
 *         description: Program updated successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Program not found
 */
router.put('/:id', auth, validate(schemas.program), programController.updateProgram);

/**
 * @swagger
 * /api/programs/{id}:
 *   delete:
 *     summary: Delete a program
 *     tags: [Programs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Program not found
 */
router.delete('/:id', auth, programController.deleteProgram);

module.exports = router; 