const personService = require('../services/personService');
const UserEventService = require('../services/userEventService');
const { Project } = require('../models');

/**
 * Person Controller
 * Handles HTTP requests for Person entities
 */

/**
 * Get all persons with pagination, filtering, and search
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersons = async (req, res) => {
    try {
        const result = await personService.getPersons(req.query);
        res.json(result);
    } catch (error) {
        console.error('Get persons error:', error);
        res.status(500).json({
            message: 'Server error retrieving persons',
            error: error.message
        });
    }
};

/**
 * Get a person by ID with optional related data
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonById = async (req, res) => {
    try {
        const { personId } = req.params;
        const options = {
            includeEvents: req.query.includeEvents === 'true',
            includeRelationships: req.query.includeRelationships === 'true',
            includeDocuments: req.query.includeDocuments === 'true'
        };

        const person = await personService.getPersonById(personId, options);

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json(person);
    } catch (error) {
        console.error('Get person error:', error);
        res.status(500).json({
            message: 'Server error retrieving person',
            error: error.message
        });
    }
};

/**
 * Create a new person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPerson = async (req, res) => {
    try {
        // Extract events from request body
        const { events, ...personData } = req.body;

        // Pass events to personService
        const person = await personService.createPerson(personData, events);

        // Create user events for person creation
        if (req.body.project_id) {
            // Create event for the actor (the user who created the person)
            await UserEventService.createEvent(
                req.user.user_id,
                req.user.user_id,
                'person_created',
                `Added person: ${person.first_name} ${person.last_name}`,
                projectId,
                'person'
            );

            // Create events for all project users
            await UserEventService.createEventForProjectUsers(
                projectId,
                req.user.user_id,
                'person_created',
                `New family member added to project: ${person.first_name} ${person.last_name}`,
                projectId,
                'person'
            );
        }

        res.status(201).json({
            message: 'Person created successfully',
            person
        });
    } catch (error) {
        console.error('Create person error:', error);
        res.status(500).json({
            message: 'Server error creating person',
            error: error.message
        });
    }
};

/**
 * Update a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePerson = async (req, res) => {
    try {
        const { personId } = req.params;
        const projectId = req.body.project_id

        // Extract events and deletedEventIds from request body
        const { events, deletedEventIds, ...personData } = req.body;

        // Pass events and deletedEventIds to personService
        const person = await personService.updatePerson(personId, personData, events, deletedEventIds);

        // Create user events for person update
        if (projectId) {
            // Create event for the actor (the user who updated the person)
            await UserEventService.createEvent(
                req.user.user_id,
                req.user.user_id,
                'person_updated',
                `Updated person: ${person.first_name} ${person.last_name}`,
                projectId,
                'person'
            );

            // Create events for all project users
            await UserEventService.createEventForProjectUsers(
                projectId,
                req.user.user_id,
                'person_updated',
                `Family member information updated: ${person.first_name} ${person.last_name}`,
                projectId,
                'person'
            );
        }

        res.json({
            message: 'Person updated successfully',
            person
        });
    } catch (error) {
        console.error('Update person error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error updating person',
            error: error.message
        });
    }
};

/**
 * Delete a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePerson = async (req, res) => {
    try {
        const { personId } = req.params;

        // Get person info before deleting
        const person = await personService.getPersonById(personId);

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        // Get project ID from query parameter or request body
        const projectId = req.query.project_id || req.body.project_id;

        // Store person info for events
        const personName = `${person.first_name} ${person.last_name}`;

        // Delete the person
        await personService.deletePerson(personId);

        // Create user events for person deletion
        if (projectId) {
            // Create event for the actor (the user who deleted the person)
            await UserEventService.createEvent(
                req.user.user_id,
                req.user.user_id,
                'person_deleted',
                `Deleted person: ${personName}`,
                null, // No person ID since it's deleted
                'person'
            );

            // Create events for all project users
            await UserEventService.createEventForProjectUsers(
                projectId,
                req.user.user_id,
                'person_deleted',
                `Family member removed: ${personName}`,
                projectId,
                'person'
            );
        }

        res.json({
            message: 'Person deleted successfully'
        });
    } catch (error) {
        console.error('Delete person error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error deleting person',
            error: error.message
        });
    }
};

/**
 * Get events for a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonEvents = async (req, res) => {
    try {
        const { personId } = req.params;
        const person = await personService.getPersonById(personId, { includeEvents: true });

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json(person.events || []);
    } catch (error) {
        console.error('Get person events error:', error);
        res.status(500).json({
            message: 'Server error retrieving person events',
            error: error.message
        });
    }
};

/**
 * Get relationships for a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonRelationships = async (req, res) => {
    try {
        const { personId } = req.params;
        const familyMembers = await personService.getFamilyMembers(personId);

        res.json(familyMembers);
    } catch (error) {
        console.error('Get person relationships error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error retrieving person relationships',
            error: error.message
        });
    }
};

/**
 * Get documents for a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonDocuments = async (req, res) => {
    try {
        const { personId } = req.params;
        const person = await personService.getPersonById(personId, { includeDocuments: true });

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json(person.documents || []);
    } catch (error) {
        console.error('Get person documents error:', error);
        res.status(500).json({
            message: 'Server error retrieving person documents',
            error: error.message
        });
    }
};

/**
 * Add a person to a project
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addPersonToProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { person_id } = req.body;

        if (!projectId || !person_id) {
            return res.status(400).json({
                message: 'Project ID and Person ID are required'
            });
        }

        // Get project and person info
        const project = await Project.findByPk(projectId);
        const person = await personService.getPersonById(person_id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!person) {
            return res.status(404).json({ message: 'Person not found' });
        }

        // Add person to project
        const { ProjectPerson } = require('../models');
        const projectPerson = await ProjectPerson.create({
            project_id: projectId,
            person_id: person_id
        });

        // Create user events
        // Create event for the actor (the user who added the person to the project)
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'person_added_to_project',
            `Added ${person.first_name} ${person.last_name} to project: ${project.title}`,
            person.person_id,
            'person'
        );

        // Create events for all project users
        await UserEventService.createEventForProjectUsers(
            projectId,
            req.user.user_id,
            'person_added_to_project',
            `New family member added to project: ${person.first_name} ${person.last_name}`,
            person.person_id,
            'person'
        );

        res.status(201).json({
            message: 'Person added to project successfully',
            projectPerson
        });
    } catch (error) {
        console.error('Add person to project error:', error);

        // Handle duplicate entry
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: 'Person is already in this project'
            });
        }

        res.status(500).json({
            message: 'Server error adding person to project',
            error: error.message
        });
    }
};

/**
 * Get ancestors of a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonAncestors = async (req, res) => {
    try {
        const { personId } = req.params;
        const generations = parseInt(req.query.generations, 10) || 3;

        const ancestors = await personService.getAncestors(personId, generations);

        res.json(ancestors);
    } catch (error) {
        console.error('Get person ancestors error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error retrieving person ancestors',
            error: error.message
        });
    }
};

/**
 * Get descendants of a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonDescendants = async (req, res) => {
    try {
        const { personId } = req.params;
        const generations = parseInt(req.query.generations, 10) || 3;

        const descendants = await personService.getDescendants(personId, generations);

        res.json(descendants);
    } catch (error) {
        console.error('Get person descendants error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error retrieving person descendants',
            error: error.message
        });
    }
};
