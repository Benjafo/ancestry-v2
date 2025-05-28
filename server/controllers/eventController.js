const eventService = require('../services/eventService');
const UserEventService = require('../services/userEventService');
const { Person } = require('../models');
const ProjectUtils = require('../utils/projectUtils');

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

        // Trigger user event for event creation
        console.log(`[DEBUG] Entering createEvent for event type: ${event.event_type}`);
        console.log(`[DEBUG] Event object after service call:`, event);

        if (event.dataValues.person_id) {
            const person = await Person.findByPk(event.dataValues.person_id);
            console.log(`[DEBUG] Event associated with person: ${event.dataValues.person_id}`);
            const projectIds = await ProjectUtils.getProjectIdsForEntity('person', event.dataValues.person_id);
            console.log(`[DEBUG] Projects associated with person ${event.dataValues.person_id}:`, projectIds);

            for (const projectId of projectIds) {
                const message = `New event "${event.event_type}" created for ${person.first_name} ${person.last_name}`;
                console.log(`[DEBUG] Logging event_created for project ${projectId}: ${message}`);
                await UserEventService.createEventForProjectUsers(
                    projectId,
                    req.user.user_id,
                    'event_created',
                    message,
                    projectId,
                    'project'
                );
            }
        } else {
            // If event is not associated with a person, it might be a project-level event
            // This case is less common for events, but we handle it if a projectId is explicitly provided
            const projectId = req.body.projectId;
            console.log(`[DEBUG] Event not associated with person. Explicit projectId from body: ${projectId}`);
            if (projectId) {
                const message = `New event "${event.event_type}" created`;
                console.log(`[DEBUG] Logging event_created for project ${projectId}: ${message}`);
                await UserEventService.createEventForProjectUsers(
                    projectId,
                    req.user.user_id,
                    'event_created',
                    message,
                    projectId,
                    'project'
                );
            }
        }

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

        // Trigger user event for event update
        console.log(`[DEBUG] Entering updateEvent for event ID: ${eventId}, Type: ${event.event_type}`);
        console.log(`[DEBUG] Event object after service call:`, event);

        if (event.dataValues.person_id) {
            const person = await Person.findByPk(event.dataValues.person_id);
            console.log(`[DEBUG] Event associated with person: ${event.dataValues.person_id}`);
            if (person) {
                const projectIds = await ProjectUtils.getProjectIdsForEntity('person', event.dataValues.person_id);
                console.log(`[DEBUG] Projects associated with person ${event.dataValues.person_id}:`, projectIds);

                for (const projectId of projectIds) {
                    const message = `Event "${event.event_type}" for ${person.first_name} ${person.last_name} has been updated`;
                    console.log(`[DEBUG] Logging event_updated for project ${projectId}: ${message}`);
                    await UserEventService.createEventForProjectUsers(
                        projectId,
                        req.user.user_id,
                        'event_updated',
                        message,
                        projectId,
                        'project'
                    );
                }
            } else {
                // If event is not associated with a person, it might be a project-level event
                const projectId = req.body.projectId;
                console.log(`[DEBUG] Event not associated with person. Explicit projectId from body: ${projectId}`);
                if (projectId) {
                    const message = `Event "${event.event_type}" has been updated`;
                    console.log(`[DEBUG] Logging event_updated for project ${projectId}: ${message}`);
                    await UserEventService.createEventForProjectUsers(
                        projectId,
                        req.user.user_id,
                        'event_updated',
                        message,
                        projectId,
                        'project'
                    );
                }
            }
        }

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
        // Fetch event details before deleting for the event message
        const eventToDelete = await eventService.getEventById(eventId, { includePerson: true });
        console.log(`[DEBUG] Deleting event: ${eventId}, Type: ${eventToDelete?.event_type}`);

        // Get project IDs before deleting the event, as associations might be removed
        let projectIds = [];
        if (eventToDelete && eventToDelete.persons && eventToDelete.persons.length > 0) {
            const personId = eventToDelete.persons[0].person_id;
            console.log(`[DEBUG] Event associated with person: ${personId}`);
            projectIds = await ProjectUtils.getProjectIdsForEntity('person', personId);
            console.log(`[DEBUG] Projects associated with person ${personId} for event deletion:`, projectIds);
        } else if (req.query.projectId) { // Fallback for project-level events if no person_id
            projectIds.push(req.query.projectId);
            console.log(`[DEBUG] Event not associated with person. Explicit projectId from query: ${req.query.projectId}`);
        }

        await eventService.deleteEvent(eventId);

        // Trigger user event for event deletion for all associated projects
        if (eventToDelete) {
            const personName = (eventToDelete.persons && eventToDelete.persons.length > 0) ?
                `${eventToDelete.persons[0].first_name} ${eventToDelete.persons[0].last_name}` : '';
            const message = (eventToDelete.persons && eventToDelete.persons.length > 0) ?
                `Event "${eventToDelete.event_type}" for ${personName} has been deleted` :
                `Event "${eventToDelete.event_type}" has been deleted`;

            console.log(`[DEBUG] Attempting to log event_deleted for event: ${eventId}`);
            for (const projectId of projectIds) {
                try {
                    console.log(`[DEBUG] Logging event_deleted for project ${projectId}: ${message}`);
                    await UserEventService.createEventForProjectUsers(
                        projectId,
                        req.user.user_id,
                        'event_deleted',
                        message,
                        projectId,
                        'project'
                    );
                    console.log(`[DEBUG] Successfully logged event_deleted for project: ${projectId}`);
                } catch (eventError) {
                    console.error(`[DEBUG] Error logging event_deleted for project ${projectId}:`, eventError);
                }
            }
        }

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
