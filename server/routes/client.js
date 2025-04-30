const express = require('express');
const router = express.Router();
const clientProfileController = require('../controllers/clientProfileController');
const { verifyToken } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/client/profile
 * @desc    Get client profile
 * @access  Private
 */
router.get('/profile', clientProfileController.getProfile);

/**
 * @route   PUT /api/client/profile
 * @desc    Update client profile
 * @access  Private
 */
router.put('/profile', clientProfileController.updateProfile);

module.exports = router;
