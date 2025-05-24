const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken, hasRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
    createProjectValidation,
    updateProjectValidation,
    projectIdValidation,
    addProjectPersonValidation,
    updateProjectPersonValidation,
    projectPersonIdValidation
} = require('../validations/projectValidations');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', projectController.getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', validate(projectIdValidation), projectController.getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (Manager only)
 */
router.post('/', hasRole('manager'), validate(createProjectValidation), projectController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', validate(updateProjectValidation), projectController.updateProject);

/**
 * @route   GET /api/projects/:id/persons
 * @desc    Get all persons in a project
 * @access  Private
 */
router.get('/:id/persons', validate(projectIdValidation), projectController.getProjectPersons);

/**
 * @route   POST /api/projects/:id/persons
 * @desc    Add a person to a project
 * @access  Private
 */
router.post('/:id/persons', validate(addProjectPersonValidation), projectController.addPersonToProject);

/**
 * @route   PUT /api/projects/:id/persons/:personId
 * @desc    Update a person's association with a project
 * @access  Private
 */
router.put('/:id/persons/:personId', validate(updateProjectPersonValidation), projectController.updateProjectPerson);

/**
 * @route   DELETE /api/projects/:id/persons/:personId
 * @desc    Remove a person from a project
 * @access  Private
 */
router.delete('/:id/persons/:personId', validate(projectPersonIdValidation), projectController.removePersonFromProject);

/**
 * @route   GET /api/projects/:id/events
 * @desc    Get user events for a specific project
 * @access  Private
 */
router.get('/:id/events', validate(projectIdValidation), projectController.getProjectEvents);

/**
 * @route   GET /api/projects/:id/relationships
 * @desc    Get relationships for a specific project
 * @access  Private
 */
router.get('/:id/relationships', validate(projectIdValidation), projectController.getProjectRelationships);

/**
 * @route   GET /api/projects/:projectId/documents
 * @desc    Get documents for a specific project
 * @access  Private
 */
router.get('/:projectId/documents', validate(projectIdValidation), require('../controllers/documentController').getProjectDocuments);

module.exports = router;
