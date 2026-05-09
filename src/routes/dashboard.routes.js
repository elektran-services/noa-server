const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary for the station
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary with counts and current/next program
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 counts:
 *                   type: object
 *                   properties:
 *                     programs:
 *                       type: integer
 *                       example: 42
 *                     oaps:
 *                       type: integer
 *                       example: 10
 *                     media:
 *                       type: integer
 *                       example: 250
 *                 nowOnAir:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Program'
 *                     - type: 'null'
 *                 upNext:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Program'
 *                     - type: 'null'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router; 