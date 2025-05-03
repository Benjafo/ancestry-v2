const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
    createDocumentValidation,
    updateDocumentValidation,
    documentIdValidation,
    associateDocumentPersonValidation,
    getDocumentsByPersonValidation
} = require('../validations/documentValidations');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   GET /api/documents
 * @desc    Get all documents
 * @access  Private
 */
router.get('/', documentController.getDocuments);

/**
 * @route   GET /api/documents/:documentId
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:documentId', validate(documentIdValidation), documentController.getDocumentById);

/**
 * @route   POST /api/documents
 * @desc    Create a new document
 * @access  Private
 */
router.post('/', validate(createDocumentValidation), documentController.createDocument);

/**
 * @route   PUT /api/documents/:documentId
 * @desc    Update a document
 * @access  Private
 */
router.put('/:documentId', validate(updateDocumentValidation), documentController.updateDocument);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:documentId', validate(documentIdValidation), documentController.deleteDocument);

/**
 * @route   POST /api/documents/associate
 * @desc    Associate a document with a person
 * @access  Private
 */
router.post('/associate', validate(associateDocumentPersonValidation), documentController.associateDocumentWithPerson);

/**
 * @route   GET /api/documents/person/:personId
 * @desc    Get documents for a person
 * @access  Private
 */
router.get('/person/:personId', validate(getDocumentsByPersonValidation), documentController.getDocumentsByPersonId);

/**
 * @route   GET /api/documents/type/:type
 * @desc    Get documents by type
 * @access  Private
 */
router.get('/type/:type', documentController.getDocumentsByType);

/**
 * @route   GET /api/documents/date-range
 * @desc    Get documents by date range
 * @access  Private
 */
router.get('/date-range', documentController.getDocumentsByDateRange);

/**
 * @route   PUT /api/documents/association/:documentId/:personId
 * @desc    Update document-person association
 * @access  Private
 */
router.put('/association/:documentId/:personId', documentController.updateDocumentPersonAssociation);

/**
 * @route   DELETE /api/documents/association/:documentId/:personId
 * @desc    Remove document-person association
 * @access  Private
 */
router.delete('/association/:documentId/:personId', documentController.removeDocumentPersonAssociation);

/**
 * @route   GET /api/documents/association/:documentId/:personId
 * @desc    Get document-person association
 * @access  Private
 */
router.get('/association/:documentId/:personId', documentController.getDocumentPersonAssociation);

module.exports = router;
