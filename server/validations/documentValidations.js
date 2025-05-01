const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');
const path = require('path');

/**
 * Validation rules for creating a new document
 */
exports.createDocumentValidation = [
    body('title')
        .notEmpty().withMessage(errorMessages.required('Title'))
        .isString().withMessage('Title must be a string')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    
    body('document_type')
        .notEmpty().withMessage(errorMessages.required('Document type'))
        .isString().withMessage('Document type must be a string')
        .isIn(['photo', 'certificate', 'letter', 'record', 'newspaper', 'census', 'military', 'legal', 'map', 'audio', 'video', 'other'])
        .withMessage('Invalid document type'),
    
    body('file_path')
        .notEmpty().withMessage(errorMessages.required('File path'))
        .isString().withMessage('File path must be a string')
        .custom((value, { req }) => {
            if (!value) return true;
            
            const ext = path.extname(value).toLowerCase();
            
            // Define valid extensions for each document type
            const validExtensions = {
                photo: ['.jpg', '.jpeg', '.png', '.gif', '.tiff'],
                certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
                letter: ['.pdf', '.doc', '.docx', '.txt'],
                record: ['.pdf', '.doc', '.docx', '.txt', '.csv'],
                newspaper: ['.pdf', '.jpg', '.jpeg', '.png'],
                census: ['.pdf', '.jpg', '.jpeg', '.png', '.csv'],
                military: ['.pdf', '.jpg', '.jpeg', '.png'],
                legal: ['.pdf', '.doc', '.docx', '.txt'],
                map: ['.jpg', '.jpeg', '.png', '.pdf', '.tiff'],
                audio: ['.mp3', '.wav', '.ogg'],
                video: ['.mp4', '.avi', '.mov', '.wmv'],
                other: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.zip', '.rar']
            };
            
            // Check if extension is valid for the document type
            if (req.body.document_type && validExtensions[req.body.document_type] && 
                !validExtensions[req.body.document_type].includes(ext)) {
                throw new Error(`Invalid file extension for document type '${req.body.document_type}'`);
            }
            
            return true;
        }),
    
    body('file_size')
        .optional()
        .isInt({ min: 0 }).withMessage('File size must be a non-negative integer'),
    
    body('mime_type')
        .optional()
        .isString().withMessage('MIME type must be a string')
        .custom((value) => {
            if (!value) return true;
            
            // Basic MIME type validation
            const validMimeTypes = [
                // Images
                'image/jpeg', 'image/png', 'image/gif', 'image/tiff',
                // Documents
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain', 'text/html', 'text/csv',
                // Audio
                'audio/mpeg', 'audio/wav', 'audio/ogg',
                // Video
                'video/mp4', 'video/mpeg', 'video/quicktime',
                // Archives
                'application/zip', 'application/x-rar-compressed'
            ];
            
            if (!validMimeTypes.includes(value)) {
                throw new Error('Invalid MIME type');
            }
            
            return true;
        }),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    
    body('source')
        .optional()
        .isString().withMessage('Source must be a string')
        .isLength({ max: 255 }).withMessage('Source cannot exceed 255 characters'),
    
    body('date_of_original')
        .optional()
        .isISO8601().withMessage('Date of original must be a valid date in ISO 8601 format')
];

/**
 * Validation rules for updating a document
 */
exports.updateDocumentValidation = [
    param('documentId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('title')
        .optional()
        .notEmpty().withMessage('Title cannot be empty if provided')
        .isString().withMessage('Title must be a string')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    
    body('document_type')
        .optional()
        .isString().withMessage('Document type must be a string')
        .isIn(['photo', 'certificate', 'letter', 'record', 'newspaper', 'census', 'military', 'legal', 'map', 'audio', 'video', 'other'])
        .withMessage('Invalid document type'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    
    body('source')
        .optional()
        .isString().withMessage('Source must be a string')
        .isLength({ max: 255 }).withMessage('Source cannot exceed 255 characters'),
    
    body('date_of_original')
        .optional()
        .isISO8601().withMessage('Date of original must be a valid date in ISO 8601 format')
];

/**
 * Validation for document ID parameter
 */
exports.documentIdValidation = [
    param('documentId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for associating a document with a person
 */
exports.associateDocumentPersonValidation = [
    body('document_id')
        .notEmpty().withMessage(errorMessages.required('Document ID'))
        .isUUID().withMessage('Document ID must be a valid UUID'),
    
    body('person_id')
        .notEmpty().withMessage(errorMessages.required('Person ID'))
        .isUUID().withMessage('Person ID must be a valid UUID'),
    
    body('relevance')
        .optional()
        .isString().withMessage('Relevance must be a string')
        .isIn(['primary', 'secondary', 'mentioned']).withMessage('Relevance must be one of: primary, secondary, mentioned'),
    
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
];

/**
 * Validation for getting documents by person ID
 */
exports.getDocumentsByPersonValidation = [
    param('personId')
        .isUUID().withMessage(errorMessages.uuid)
];
