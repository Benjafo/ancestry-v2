const { UserEvent, User } = require('../models');

/**
 * Create a new user event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createUserEvent = async (req, res) => {
    try {
        const { event_type, message, entity_id, entity_type } = req.body;
        
        // Create the user event
        const userEvent = await UserEvent.create({
            user_id: req.user.user_id,  // The user receiving the event
            actor_id: req.user.user_id, // The user creating the event (same as receiver in this case)
            event_type,
            message,
            entity_id,
            entity_type
        });
        
        // Get the actor information for the response
        const actor = await User.findByPk(req.user.user_id, {
            attributes: ['first_name', 'last_name']
        });
        
        // Add actor to the response
        const userEventWithActor = {
            ...userEvent.toJSON(),
            actor: actor ? {
                first_name: actor.first_name,
                last_name: actor.last_name
            } : null
        };
        
        res.status(201).json({
            message: 'User event created successfully',
            event: userEventWithActor
        });
    } catch (error) {
        console.error('Create user event error:', error);
        res.status(500).json({ 
            message: 'Server error creating user event',
            error: error.message
        });
    }
};

/**
 * Get user events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserEvents = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            eventType,
            entityId,
            entityType
        } = req.query;
        
        // Build query options
        const queryOptions = {
            where: {
                user_id: req.user.user_id
            },
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        };
        
        // Add filters if provided
        if (eventType) {
            queryOptions.where.event_type = eventType;
        }
        
        if (entityId) {
            queryOptions.where.entity_id = entityId;
        }
        
        if (entityType) {
            queryOptions.where.entity_type = entityType;
        }
        
        // Get events
        const { count, rows: events } = await UserEvent.findAndCountAll(queryOptions);
        
        // Calculate total pages
        const totalPages = Math.ceil(count / parseInt(limit));
        
        res.json({
            events,
            metadata: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving user events',
            error: error.message
        });
    }
};

/**
 * Get a user event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserEventById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const userEvent = await UserEvent.findOne({
            where: {
                id,
                user_id: req.user.user_id
            },
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        });
        
        if (!userEvent) {
            return res.status(404).json({ message: 'User event not found' });
        }
        
        res.json(userEvent);
    } catch (error) {
        console.error('Get user event error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving user event',
            error: error.message
        });
    }
};

/**
 * Update a user event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUserEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        
        // Find the user event
        const userEvent = await UserEvent.findByPk(id);
        
        if (!userEvent) {
            return res.status(404).json({ message: 'User event not found' });
        }
        
        // Check if user is authorized to update this event
        // Allow if user is a manager or the original actor
        const isManager = req.user.roles.includes('manager');
        const isActor = userEvent.actor_id === req.user.user_id;
        
        if (!isManager && !isActor) {
            return res.status(403).json({ message: 'You are not authorized to update this event' });
        }
        
        // Update the event
        userEvent.message = message;
        await userEvent.save();
        
        // Get the actor information for the response
        const actor = await User.findByPk(userEvent.actor_id, {
            attributes: ['first_name', 'last_name']
        });
        
        // Add actor to the response
        const userEventWithActor = {
            ...userEvent.toJSON(),
            actor: actor ? {
                first_name: actor.first_name,
                last_name: actor.last_name
            } : null
        };
        
        res.json({
            message: 'User event updated successfully',
            event: userEventWithActor
        });
    } catch (error) {
        console.error('Update user event error:', error);
        res.status(500).json({ 
            message: 'Server error updating user event',
            error: error.message
        });
    }
};

/**
 * Delete a user event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUserEvent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the user event
        const userEvent = await UserEvent.findByPk(id);
        
        if (!userEvent) {
            return res.status(404).json({ message: 'User event not found' });
        }
        
        // Check if user is authorized to delete this event
        // Allow if user is a manager or the original actor
        const isManager = req.user.roles.includes('manager');
        const isActor = userEvent.actor_id === req.user.user_id;
        
        if (!isManager && !isActor) {
            return res.status(403).json({ message: 'You are not authorized to delete this event' });
        }
        
        // Delete the event
        await userEvent.destroy();
        
        res.json({
            message: 'User event deleted successfully'
        });
    } catch (error) {
        console.error('Delete user event error:', error);
        res.status(500).json({ 
            message: 'Server error deleting user event',
            error: error.message
        });
    }
};
