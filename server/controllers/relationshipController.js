const relationshipService = require('../services/relationshipService');
const UserEventService = require('../services/userEventService');
const { Person, ProjectPerson } = require('../models');

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

        // Get person details for the event message
        const person1 = await Person.findByPk(relationship.person1_id);
        const person2 = await Person.findByPk(relationship.person2_id);

        if (person1 && person2) {
            // Create a descriptive message based on relationship type
            let relationshipDescription = '';
            switch (relationship.relationship_type) {
                case 'parent':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} as parent of ${person2.first_name} ${person2.last_name}`;
                    break;
                case 'spouse':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name} as spouses`;
                    break;
                case 'sibling':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name} as siblings`;
                    break;
                default:
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name}`;
            }

            console.log(req.body)

            // Create event for the actor
            await UserEventService.createEvent(
                req.user.user_id,
                req.user.user_id,
                'relationship_created',
                `Created relationship: ${relationshipDescription}`,
                req.user.user_id,
                'relationship'
            );

            // Check if either person is in a project and create project events
            const projectPersons1 = await ProjectPerson.findAll({
                where: { person_id: person1.person_id }
            });

            const projectPersons2 = await ProjectPerson.findAll({
                where: { person_id: person2.person_id }
            });

            // Get unique project IDs
            const projectIds = new Set();
            projectPersons1.forEach(pp => projectIds.add(pp.project_id));
            projectPersons2.forEach(pp => projectIds.add(pp.project_id));

            // Create events for all relevant projects
            for (const projectId of projectIds) {
                await UserEventService.createEventForProjectUsers(
                    projectId,
                    req.user.user_id,
                    'relationship_created',
                    `New relationship created: ${relationshipDescription}`,
                    projectId,
                    'relationship'
                );
            }
        }

        res.status(201).json({
            message: 'Relationship created successfully',
            relationship
        });
    } catch (error) {
        console.error('Create relationship error:', error);

        // Handle specific custom errors thrown by the service
        if (error.message.includes('not found') ||
            error.message.includes('already exists') ||
            error.message.includes('Circular relationship') ||
            error.message.includes('Only \'parent\' and \'spouse\' relationships can be created directly') ||
            error.message.includes('is not a valid qualifier for')) {
            return res.status(400).json({
                message: error.message
            });
        }

        // For all other errors, including Sequelize Validation Errors, let the global error handler process them
        throw error;
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

        // Get the relationship before updating for comparison
        const oldRelationship = await relationshipService.getRelationshipById(relationshipId);
        if (!oldRelationship) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        // Update the relationship
        const relationship = await relationshipService.updateRelationship(relationshipId, req.body);

        // Get person details for the event message
        const person1 = await Person.findByPk(relationship.person1_id);
        const person2 = await Person.findByPk(relationship.person2_id);

        if (person1 && person2) {
            // Create a descriptive message based on relationship type
            let relationshipDescription = '';
            switch (relationship.relationship_type) {
                case 'parent':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} as parent of ${person2.first_name} ${person2.last_name}`;
                    break;
                case 'spouse':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name} as spouses`;
                    break;
                case 'sibling':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name} as siblings`;
                    break;
                default:
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name}`;
            }

            // Create event for the actor
            await UserEventService.createEvent(
                req.user.user_id,
                req.user.user_id,
                'relationship_updated',
                `Updated relationship: ${relationshipDescription}`,
                relationshipId,
                'relationship'
            );

            // Check if either person is in a project and create project events
            const projectPersons1 = await ProjectPerson.findAll({
                where: { person_id: person1.person_id }
            });

            const projectPersons2 = await ProjectPerson.findAll({
                where: { person_id: person2.person_id }
            });

            // Get unique project IDs
            const projectIds = new Set();
            projectPersons1.forEach(pp => projectIds.add(pp.project_id));
            projectPersons2.forEach(pp => projectIds.add(pp.project_id));

            // Create events for all relevant projects
            for (const projectId of projectIds) {
                await UserEventService.createEventForProjectUsers(
                    projectId,
                    req.user.user_id,
                    'relationship_updated',
                    `Relationship updated: ${relationshipDescription}`,
                    projectId,
                    'relationship'
                );
            }
        }

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

        // Handle specific custom errors thrown by the service
        if (error.message.includes('Only \'parent\' and \'spouse\' relationships can be updated directly') ||
            error.message.includes('Invalid relationship type') ||
            error.message.includes('is not a valid qualifier for')) {
            return res.status(400).json({
                message: error.message
            });
        }

        // For all other errors, including Sequelize Validation Errors, let the global error handler process them
        throw error;
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

        // Get the relationship before deleting for event creation
        const relationship = await relationshipService.getRelationshipById(relationshipId);
        if (!relationship) {
            return res.status(404).json({ message: 'Relationship not found' });
        }

        // Get person details for the event message
        const person1 = await Person.findByPk(relationship.person1_id);
        const person2 = await Person.findByPk(relationship.person2_id);

        // Check if either person is in a project and get project IDs
        let projectIds = new Set();
        if (person1 && person2) {
            const projectPersons1 = await ProjectPerson.findAll({
                where: { person_id: person1.person_id }
            });

            const projectPersons2 = await ProjectPerson.findAll({
                where: { person_id: person2.person_id }
            });

            // Get unique project IDs
            projectPersons1.forEach(pp => projectIds.add(pp.project_id));
            projectPersons2.forEach(pp => projectIds.add(pp.project_id));
        }

        // Delete the relationship
        await relationshipService.deleteRelationship(relationshipId);

        // Create user events after successful deletion
        if (person1 && person2) {
            // Create a descriptive message based on relationship type
            let relationshipDescription = '';
            switch (relationship.relationship_type) {
                case 'parent':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} as parent of ${person2.first_name} ${person2.last_name}`;
                    break;
                case 'spouse':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name} as spouses`;
                    break;
                case 'sibling':
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name} as siblings`;
                    break;
                default:
                    relationshipDescription = `${person1.first_name} ${person1.last_name} and ${person2.first_name} ${person2.last_name}`;
            }

            // Create event for the actor
            await UserEventService.createEvent(
                req.user.user_id,
                req.user.user_id,
                'relationship_deleted',
                `Deleted relationship: ${relationshipDescription}`,
                null, // No relationship ID since it's deleted
                'relationship'
            );

            // Create events for all relevant projects
            for (const projectId of projectIds) {
                await UserEventService.createEventForProjectUsers(
                    projectId,
                    req.user.user_id,
                    'relationship_deleted',
                    `Relationship deleted: ${relationshipDescription}`,
                    projectId,
                    'relationship'
                );
            }
        }

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
