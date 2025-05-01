const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new project
 */
exports.createProjectValidation = [
    body('title')
        .notEmpty().withMessage(errorMessages.required('Title'))
        .isString().withMessage('Title must be a string')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
];

/**
 * Validation rules for updating a project
 */
exports.updateProjectValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('title')
        .optional()
        .notEmpty().withMessage('Title cannot be empty if provided')
        .isString().withMessage('Title must be a string')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    
    body('status')
        .optional()
        .isIn(['active', 'completed', 'on_hold']).withMessage('Status must be one of: active, completed, on_hold')
];

/**
 * Validation for project ID parameter
 */
exports.projectIdValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation rules for adding a document to a project
 */
exports.addProjectDocumentValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('title')
        .notEmpty().withMessage(errorMessages.required('Title'))
        .isString().withMessage('Title must be a string')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    
    body('type')
        .notEmpty().withMessage(errorMessages.required('Type'))
        .isString().withMessage('Type must be a string')
        .isIn(['photo', 'certificate', 'letter', 'record', 'newspaper', 'census', 'military', 'legal', 'map', 'audio', 'video', 'other'])
        .withMessage('Invalid document type'),
    
    body('file_path')
        .notEmpty().withMessage(errorMessages.required('File path'))
        .isString().withMessage('File path must be a string')
];

/**
 * Validation rules for adding a timeline event to a project
 */
exports.addProjectTimelineValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('date')
        .notEmpty().withMessage(errorMessages.required('Date'))
        .isISO8601().withMessage('Date must be a valid date in ISO 8601 format'),
    
    body('event')
        .notEmpty().withMessage(errorMessages.required('Event'))
        .isString().withMessage('Event must be a string')
        .isLength({ min: 3, max: 255 }).withMessage('Event must be between 3 and 255 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
];
