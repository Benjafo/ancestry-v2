const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// File filter to validate file types
const fileFilter = function (req, file, cb) {
    // Accept all file types for now, validation will be done in the controller
    cb(null, true);
};

// Initialize multer with the storage configuration
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
});
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

/**
 * @route   GET /api/documents/:documentId/file
 * @desc    Get document file for viewing or downloading
 * @access  Private
 */
router.get('/:documentId/file', documentController.getDocumentFile);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a document file
 * @access  Private
 */
router.post('/upload', upload.single('file'), documentController.uploadDocumentFile);

module.exports = router;
