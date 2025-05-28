const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
    createEventValidation,
    updateEventValidation,
    eventIdValidation,
    getEventsByPersonValidation
} = require('../validations/eventValidations');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Private
 */
router.get('/', eventController.getEvents);

/**
 * @route   GET /api/events/:eventId
 * @desc    Get event by ID
 * @access  Private
 */
router.get('/:eventId', validate(eventIdValidation), eventController.getEventById);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private
 */
router.post('/', validate(createEventValidation), eventController.createEvent);

/**
 * @route   PUT /api/events/:eventId
 * @desc    Update an event
 * @access  Private
 */
router.put('/:eventId', validate(updateEventValidation), eventController.updateEvent);

/**
 * @route   DELETE /api/events/:eventId
 * @desc    Delete an event
 * @access  Private
 */
router.delete('/:eventId', (req, res, next) => {
    console.log(`[DEBUG] Entering events route DELETE /api/events/${req.params.eventId}`);
    next();
}, validate(eventIdValidation), eventController.deleteEvent);

/**
 * @route   GET /api/events/person/:personId
 * @desc    Get events for a person
 * @access  Private
 */
router.get('/person/:personId', validate(getEventsByPersonValidation), eventController.getEventsByPersonId);

/**
 * @route   GET /api/events/type/:type
 * @desc    Get events by type
 * @access  Private
 */
router.get('/type/:type', eventController.getEventsByType);

/**
 * @route   GET /api/events/date-range
 * @desc    Get events by date range
 * @access  Private
 */
router.get('/date-range', eventController.getEventsByDateRange);

/**
 * @route   GET /api/events/location/:location
 * @desc    Get events by location
 * @access  Private
 */
router.get('/location/:location', eventController.getEventsByLocation);

/**
 * @route   GET /api/events/timeline/:personId
 * @desc    Get timeline for a person
 * @access  Private
 */
router.get('/timeline/:personId', validate(getEventsByPersonValidation), eventController.getPersonTimeline);

module.exports = router;
