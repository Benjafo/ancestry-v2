const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationshipController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
    createRelationshipValidation,
    updateRelationshipValidation,
    relationshipIdValidation,
    getRelationshipsByPersonValidation
} = require('../validations/relationshipValidations');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/relationships
 * @desc    Get all relationships
 * @access  Private
 */
router.get('/', relationshipController.getRelationships);

/**
 * @route   GET /api/relationships/:relationshipId
 * @desc    Get relationship by ID
 * @access  Private
 */
router.get('/:relationshipId', validate(relationshipIdValidation), relationshipController.getRelationshipById);

/**
 * @route   POST /api/relationships
 * @desc    Create a new relationship
 * @access  Private
 */
router.post('/', validate(createRelationshipValidation), relationshipController.createRelationship);

/**
 * @route   PUT /api/relationships/:relationshipId
 * @desc    Update a relationship
 * @access  Private
 */
router.put('/:relationshipId', validate(updateRelationshipValidation), relationshipController.updateRelationship);

/**
 * @route   DELETE /api/relationships/:relationshipId
 * @desc    Delete a relationship
 * @access  Private
 */
router.delete('/:relationshipId', validate(relationshipIdValidation), relationshipController.deleteRelationship);

/**
 * @route   GET /api/relationships/person/:personId
 * @desc    Get relationships for a person
 * @access  Private
 */
router.get('/person/:personId', validate(getRelationshipsByPersonValidation), relationshipController.getRelationshipsByPersonId);

/**
 * @route   GET /api/relationships/type/:type
 * @desc    Get relationships by type
 * @access  Private
 */
router.get('/type/:type', relationshipController.getRelationshipsByType);

/**
 * @route   GET /api/relationships/between/:person1Id/:person2Id
 * @desc    Get relationships between two persons
 * @access  Private
 */
router.get('/between/:person1Id/:person2Id', relationshipController.getRelationshipsBetweenPersons);

/**
 * @route   GET /api/relationships/path/:person1Id/:person2Id
 * @desc    Find relationship path between two persons
 * @access  Private
 */
router.get('/path/:person1Id/:person2Id', relationshipController.findRelationshipPath);

/**
 * @route   GET /api/relationships/parent-child
 * @desc    Get parent-child relationships
 * @access  Private
 */
router.get('/parent-child', relationshipController.getParentChildRelationships);

/**
 * @route   GET /api/relationships/spouse
 * @desc    Get spouse relationships
 * @access  Private
 */
router.get('/spouse', relationshipController.getSpouseRelationships);

module.exports = router;
