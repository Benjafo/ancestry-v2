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
 * @route   GET /api/dashboard/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', dashboardController.getNotifications);

/**
 * @route   PUT /api/dashboard/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', dashboardController.markNotificationAsRead);

module.exports = router;
