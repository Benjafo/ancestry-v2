const personService = require('../services/personService');
const UserEventService = require('../services/userEventService');
const { Project } = require('../models');
const ProjectUtils = require('../utils/projectUtils');

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
        console.log('Created person:', person);

        // Removed project-level person_created event as it's not reliably tied to a project at creation.
        // The person_added_to_project event will serve as the project-level notification.

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
        // Extract events and deletedEventIds from request body
        const { events, deletedEventIds, ...personData } = req.body;

        // Pass events and deletedEventIds to personService
        const person = await personService.updatePerson(personId, personData, events, deletedEventIds);

        // Create user events for person update
        const projectIds = await ProjectUtils.getProjectIdsForEntity('person', personId);
        if (projectIds.length > 0) {
            await UserEventService.createEventForProjectUsers(
                projectIds, // Pass the array
                req.user.user_id,
                'person_updated',
                `Family member information updated: ${person.first_name} ${person.last_name}`,
                personId, // entity_id is the person's ID
                'person' // entity_type is 'person'
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

        // Store person info for events
        const personName = `${person.first_name} ${person.last_name}`;

        // Get project IDs before deleting the person, as associations will be removed
        console.log(`[DEBUG] Deleting person: ${personId}`);
        const projectIds = await ProjectUtils.getProjectIdsForEntity('person', personId);
        console.log(`[DEBUG] Projects associated with person ${personId} before deletion:`, projectIds);

        // Delete the person
        await personService.deletePerson(personId);

        // Create user events for person deletion for all associated projects
        if (projectIds.length > 0) {
            console.log(`[DEBUG] Logging person_deleted event for project: ${projectIds}`);
            await UserEventService.createEventForProjectUsers(
                projectIds, // Pass the array
                req.user.user_id,
                'person_deleted',
                `Family member removed: ${personName}`,
                personId, // entity_id is the person's ID
                'person' // entity_type is 'person'
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
    console.log('[DEBUG] Entering addPersonToProject');
    try {
        const { projectId } = req.params;
        const { person_id } = req.body;
        console.log(`[DEBUG] addPersonToProject - projectId: ${projectId}, person_id: ${person_id}`);

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

        // Create user events for adding person to project
        await UserEventService.createEventForProjectUsers(
            [projectId], // Still an array, but with one project
            req.user.user_id,
            'person_added_to_project',
            `Added ${person.first_name} ${person.last_name} to project: ${project.title}`,
            person_id, // entity_id is the person's ID
            'person' // entity_type is 'person'
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
