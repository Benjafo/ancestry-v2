const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
    createPersonValidation,
    updatePersonValidation,
    personIdValidation,
    addPersonToProjectValidation
} = require('../validations/personValidations');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/persons
 * @desc    Get all persons
 * @access  Private
 */
router.get('/', personController.getPersons);

/**
 * @route   GET /api/persons/:personId
 * @desc    Get person by ID
 * @access  Private
 */
router.get('/:personId', validate(personIdValidation), personController.getPersonById);

/**
 * @route   POST /api/persons
 * @desc    Create a new person
 * @access  Private
 */
router.post('/', validate(createPersonValidation), personController.createPerson);

/**
 * @route   PUT /api/persons/:personId
 * @desc    Update a person
 * @access  Private
 */
router.put('/:personId', validate(updatePersonValidation), personController.updatePerson);

/**
 * @route   DELETE /api/persons/:personId
 * @desc    Delete a person
 * @access  Private
 */
router.delete('/:personId', validate(personIdValidation), personController.deletePerson);

/**
 * @route   GET /api/persons/:personId/events
 * @desc    Get events for a person
 * @access  Private
 */
router.get('/:personId/events', validate(personIdValidation), personController.getPersonEvents);

/**
 * @route   GET /api/persons/:personId/relationships
 * @desc    Get relationships for a person
 * @access  Private
 */
router.get('/:personId/relationships', validate(personIdValidation), personController.getPersonRelationships);

/**
 * @route   GET /api/persons/:personId/documents
 * @desc    Get documents for a person
 * @access  Private
 */
router.get('/:personId/documents', validate(personIdValidation), personController.getPersonDocuments);

/**
 * @route   GET /api/persons/:personId/ancestors
 * @desc    Get ancestors of a person
 * @access  Private
 */
router.get('/:personId/ancestors', validate(personIdValidation), personController.getPersonAncestors);

/**
 * @route   GET /api/persons/:personId/descendants
 * @desc    Get descendants of a person
 * @access  Private
 */
router.get('/:personId/descendants', validate(personIdValidation), personController.getPersonDescendants);

/**
 * @route   POST /api/projects/:projectId/persons
 * @desc    Add a person to a project
 * @access  Private
 */
router.post('/projects/:projectId/persons', validate(addPersonToProjectValidation), personController.addPersonToProject);

module.exports = router;
