const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary data
 * @access  Private
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @route   GET /api/dashboard/events
 * @desc    Get user events
 * @access  Private
 */
router.get('/events', dashboardController.getUserEvents);

module.exports = router;
