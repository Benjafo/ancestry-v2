const personService = require('../services/personService');

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
        const person = await personService.createPerson(req.body);
        
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
        const person = await personService.updatePerson(personId, req.body);
        
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
        await personService.deletePerson(personId);
        
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
        
        // This would typically be handled by a projectService
        // For now, we'll just return a not implemented response
        res.status(501).json({ 
            message: 'Not implemented yet' 
        });
    } catch (error) {
        console.error('Add person to project error:', error);
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
