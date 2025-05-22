const { body, param, query } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new user event
 */
exports.createUserEventValidation = [
    body('event_type')
        .notEmpty().withMessage(errorMessages.required('Event type'))
        .isString().withMessage('Event type must be a string')
        .isIn([
            'project_created', 
            'project_updated', 
            'project_assigned', 
            'document_added', 
            'document_uploaded', 
            'person_discovered', 
            'person_created', 
            'event_created', 
            'relationship_established', 
            'relationship_created', 
            'research_milestone', 
            'project_update'
        ])
        .withMessage('Invalid event type'),
    
    body('message')
        .notEmpty().withMessage(errorMessages.required('Message'))
        .isString().withMessage('Message must be a string'),
    
    body('entity_id')
        .optional()
        .isUUID().withMessage('Entity ID must be a valid UUID'),
    
    body('entity_type')
        .optional()
        .isString().withMessage('Entity type must be a string')
        .isIn(['project', 'person', 'document', 'event', 'relationship'])
        .withMessage('Invalid entity type')
];

/**
 * Validation for user event ID parameter
 */
exports.userEventIdValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation rules for updating a user event
 */
exports.updateUserEventValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('message')
        .notEmpty().withMessage(errorMessages.required('Message'))
        .isString().withMessage('Message must be a string')
];

/**
 * Validation rules for deleting a user event
 */
exports.deleteUserEventValidation = [
    param('id')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for getting user events
 */
exports.getUserEventsValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    query('sortBy')
        .optional()
        .isString().withMessage('Sort by must be a string')
        .isIn(['createdAt', 'updatedAt', 'event_type'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isString().withMessage('Sort order must be a string')
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    
    query('eventType')
        .optional()
        .isString().withMessage('Event type must be a string'),
    
    query('entityId')
        .optional()
        .isUUID().withMessage('Entity ID must be a valid UUID'),
    
    query('entityType')
        .optional()
        .isString().withMessage('Entity type must be a string')
        .isIn(['project', 'person', 'document', 'event', 'relationship'])
        .withMessage('Invalid entity type')
];
