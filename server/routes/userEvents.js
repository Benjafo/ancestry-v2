const express = require('express');
const router = express.Router();
const userEventController = require('../controllers/userEventController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
    createUserEventValidation,
    userEventIdValidation,
    getUserEventsValidation,
    updateUserEventValidation,
    deleteUserEventValidation
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

/**
 * @route   PUT /api/user-events/:id
 * @desc    Update a user event
 * @access  Private
 */
router.put('/:id', validate(updateUserEventValidation), userEventController.updateUserEvent);

/**
 * @route   DELETE /api/user-events/:id
 * @desc    Delete a user event
 * @access  Private
 */
router.delete('/:id', validate(deleteUserEventValidation), userEventController.deleteUserEvent);

module.exports = router;
