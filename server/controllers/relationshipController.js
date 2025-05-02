const relationshipService = require('../services/relationshipService');

/**
 * Relationship Controller
 * Handles HTTP requests for Relationship entities
 */

/**
 * Get all relationships with pagination, filtering, and search
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRelationships = async (req, res) => {
    try {
        const result = await relationshipService.getRelationships(req.query);
        res.json(result);
    } catch (error) {
        console.error('Get relationships error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving relationships',
            error: error.message 
        });
    }
};

/**
 * Get a relationship by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRelationshipById = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        const relationship = await relationshipService.getRelationshipById(relationshipId);
        
        if (!relationship) {
            return res.status(404).json({ message: 'Relationship not found' });
        }
        
        res.json(relationship);
    } catch (error) {
        console.error('Get relationship error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving relationship',
            error: error.message 
        });
    }
};

/**
 * Create a new relationship
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createRelationship = async (req, res) => {
    try {
        const relationship = await relationshipService.createRelationship(req.body);
        
        res.status(201).json({
            message: 'Relationship created successfully',
            relationship
        });
    } catch (error) {
        console.error('Create relationship error:', error);
        
        // Handle validation errors
        if (error.message.includes('validation failed') || 
            error.message.includes('not found') ||
            error.message.includes('already exists') ||
            error.message.includes('Circular relationship')) {
            return res.status(400).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error creating relationship',
            error: error.message 
        });
    }
};

/**
 * Update a relationship
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateRelationship = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        const relationship = await relationshipService.updateRelationship(relationshipId, req.body);
        
        res.json({
            message: 'Relationship updated successfully',
            relationship
        });
    } catch (error) {
        console.error('Update relationship error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        // Handle validation errors
        if (error.message.includes('validation failed')) {
            return res.status(400).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error updating relationship',
            error: error.message 
        });
    }
};

/**
 * Delete a relationship
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteRelationship = async (req, res) => {
    try {
        const { relationshipId } = req.params;
        await relationshipService.deleteRelationship(relationshipId);
        
        res.json({
            message: 'Relationship deleted successfully'
        });
    } catch (error) {
        console.error('Delete relationship error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error deleting relationship',
            error: error.message 
        });
    }
};

/**
 * Get relationships by person ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRelationshipsByPersonId = async (req, res) => {
    try {
        const { personId } = req.params;
        const relationships = await relationshipService.getRelationshipsByPersonId(personId);
        
        res.json(relationships);
    } catch (error) {
        console.error('Get relationships by person error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error retrieving relationships',
            error: error.message 
        });
    }
};

/**
 * Get relationships by type
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRelationshipsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const relationships = await relationshipService.getRelationshipsByType(type);
        
        res.json(relationships);
    } catch (error) {
        console.error('Get relationships by type error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving relationships',
            error: error.message 
        });
    }
};

/**
 * Get relationships between two persons
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRelationshipsBetweenPersons = async (req, res) => {
    try {
        const { person1Id, person2Id } = req.params;
        const relationships = await relationshipService.getRelationshipsBetweenPersons(person1Id, person2Id);
        
        res.json(relationships);
    } catch (error) {
        console.error('Get relationships between persons error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error retrieving relationships',
            error: error.message 
        });
    }
};

/**
 * Find relationship path between two persons
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findRelationshipPath = async (req, res) => {
    try {
        const { person1Id, person2Id } = req.params;
        const maxDepth = parseInt(req.query.maxDepth, 10) || 5;
        
        const path = await relationshipService.findRelationshipPath(person1Id, person2Id, maxDepth);
        
        if (path.length === 0) {
            return res.json({
                message: 'No relationship path found between these persons',
                path
            });
        }
        
        res.json({
            message: 'Relationship path found',
            pathLength: path.length,
            path
        });
    } catch (error) {
        console.error('Find relationship path error:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error finding relationship path',
            error: error.message 
        });
    }
};

/**
 * Get parent-child relationships
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getParentChildRelationships = async (req, res) => {
    try {
        const relationships = await relationshipService.getParentChildRelationships();
        
        res.json(relationships);
    } catch (error) {
        console.error('Get parent-child relationships error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving parent-child relationships',
            error: error.message 
        });
    }
};

/**
 * Get spouse relationships
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSpouseRelationships = async (req, res) => {
    try {
        const relationships = await relationshipService.getSpouseRelationships();
        
        res.json(relationships);
    } catch (error) {
        console.error('Get spouse relationships error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving spouse relationships',
            error: error.message 
        });
    }
};
