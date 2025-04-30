const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken } = require('../middleware/auth');

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
router.get('/:id', projectController.getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', projectController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', projectController.updateProject);

module.exports = router;
