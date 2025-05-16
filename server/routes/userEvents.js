const express = require('express');
const router = express.Router();
const userEventController = require('../controllers/userEventController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
    createUserEventValidation,
    userEventIdValidation,
    getUserEventsValidation
} = require('../validations/userEventValidations');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/user-events
 * @desc    Get user events
 * @access  Private
 */
router.get('/', validate(getUserEventsValidation), userEventController.getUserEvents);

/**
 * @route   GET /api/user-events/:id
 * @desc    Get user event by ID
 * @access  Private
 */
router.get('/:id', validate(userEventIdValidation), userEventController.getUserEventById);

/**
 * @route   POST /api/user-events
 * @desc    Create a new user event
 * @access  Private
 */
router.post('/', validate(createUserEventValidation), userEventController.createUserEvent);

module.exports = router;
