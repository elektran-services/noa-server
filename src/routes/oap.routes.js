const express = require('express');
const router = express.Router();
const oapController = require('../controllers/oap.controller');
const auth = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /api/oaps:
 *   post:
 *     summary: Create a new OAP
 *     tags: [OAPs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OAPCreate'
 *           example:
 *             oapName: "John Doe"
 *             realName: "Jonathan Doe"
 *             profile: "Award-winning radio host with 10+ years of experience."
 *             picture: "507f1f77bcf86cd799439013"
 *     responses:
 *       201:
 *         description: OAP created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OAP created successfully
 *                 oap:
 *                   $ref: '#/components/schemas/OAP'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', validate(schemas.oapCreate), oapController.createOAP);

/**
 * @swagger
 * /api/oaps:
 *   get:
 *     summary: Get all OAPs for the station
 *     tags: [OAPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search OAPs by name
 *     responses:
 *       200:
 *         description: List of OAPs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oaps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OAP'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', oapController.getOAPs);

/**
 * @swagger
 * /api/oaps/{id}:
 *   get:
 *     summary: Get OAP by ID
 *     tags: [OAPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAP ID
 *     responses:
 *       200:
 *         description: OAP details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 oap:
 *                   $ref: '#/components/schemas/OAP'
 *       404:
 *         description: OAP not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OAP not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', oapController.getOAPById);

/**
 * @swagger
 * /api/oaps/{id}:
 *   put:
 *     summary: Update an OAP
 *     tags: [OAPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAP ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OAPUpdate'
 *     responses:
 *       200:
 *         description: OAP updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OAP updated successfully
 *                 oap:
 *                   $ref: '#/components/schemas/OAP'
 *       404:
 *         description: OAP not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', validate(schemas.oapUpdate), oapController.updateOAP);

/**
 * @swagger
 * /api/oaps/{id}:
 *   delete:
 *     summary: Delete an OAP
 *     tags: [OAPs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAP ID
 *     responses:
 *       200:
 *         description: OAP deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OAP deleted successfully
 *       404:
 *         description: OAP not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', oapController.deleteOAP);

module.exports = router; 