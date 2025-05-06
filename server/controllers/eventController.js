const eventService = require('../services/eventService');

/**
 * Event Controller
 * Handles HTTP requests for Event entities
 */

/**
 * Get all events with pagination, filtering, and search
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEvents = async (req, res) => {
    try {
        const result = await eventService.getEvents(req.query);
        res.json(result);
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving events',
            error: error.message 
        });
    }
};

/**
 * Get an event by ID with optional related data
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const options = {
            includePerson: req.query.includePerson === 'true'
        };
        
        const event = await eventService.getEventById(eventId, options);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving event',
            error: error.message 
        });
    }
};

/**
 * Create a new event
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createEvent = async (req, res) => {
    try {
        const event = await eventService.createEvent(req.body);
        
        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Create event error:', error);
        
        // Handle validation errors
        if (error.message.includes('validation failed') || 
            error.message.includes('not found') ||
            error.message.includes('consistency')) {
            return res.status(400).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error creating event',
            error: error.message 
        });
    }
};

/**
 * Update an event
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await eventService.updateEvent(eventId, req.body);
        
        res.json({
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Update event error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        // Handle validation errors
        if (error.message.includes('validation failed') || 
            error.message.includes('consistency')) {
            return res.status(400).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error updating event',
            error: error.message 
        });
    }
};

/**
 * Delete an event
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        await eventService.deleteEvent(eventId);
        
        res.json({
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error deleting event',
            error: error.message 
        });
    }
};

/**
 * Get events by person ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEventsByPersonId = async (req, res) => {
    try {
        const { personId } = req.params;
        const events = await eventService.getEventsByPersonId(personId);
        
        res.json(events);
    } catch (error) {
        console.error('Get events by person error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error retrieving events',
            error: error.message 
        });
    }
};

/**
 * Get events by type
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEventsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const events = await eventService.getEventsByType(type);
        
        res.json(events);
    } catch (error) {
        console.error('Get events by type error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving events',
            error: error.message 
        });
    }
};

/**
 * Get events by date range
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEventsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ 
                message: 'Start date and end date are required' 
            });
        }
        
        const events = await eventService.getEventsByDateRange(
            new Date(startDate), 
            new Date(endDate)
        );
        
        res.json(events);
    } catch (error) {
        console.error('Get events by date range error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving events',
            error: error.message 
        });
    }
};

/**
 * Get events by location
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getEventsByLocation = async (req, res) => {
    try {
        const { location } = req.params;
        
        if (!location) {
            return res.status(400).json({ 
                message: 'Location is required' 
            });
        }
        
        const events = await eventService.getEventsByLocation(location);
        
        res.json(events);
    } catch (error) {
        console.error('Get events by location error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving events',
            error: error.message 
        });
    }
};

/**
 * Get person timeline
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonTimeline = async (req, res) => {
    try {
        const { personId } = req.params;
        const timeline = await eventService.getPersonTimeline(personId);
        
        res.json(timeline);
    } catch (error) {
        console.error('Get person timeline error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error retrieving timeline',
            error: error.message 
        });
    }
};
