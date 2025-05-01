const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new relationship
 */
exports.createRelationshipValidation = [
    body('person1_id')
        .notEmpty().withMessage(errorMessages.required('Person 1 ID'))
        .isUUID().withMessage('Person 1 ID must be a valid UUID'),
    
    body('person2_id')
        .notEmpty().withMessage(errorMessages.required('Person 2 ID'))
        .isUUID().withMessage('Person 2 ID must be a valid UUID')
        .custom((value, { req }) => {
            if (value === req.body.person1_id) {
                throw new Error('Person 2 cannot be the same as Person 1');
            }
            return true;
        }),
    
    body('relationship_type')
        .notEmpty().withMessage(errorMessages.required('Relationship type'))
        .isString().withMessage('Relationship type must be a string')
        .isIn(['parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild', 'aunt/uncle', 'niece/nephew', 'cousin'])
        .withMessage('Invalid relationship type'),
    
    body('relationship_qualifier')
        .optional()
        .isString().withMessage('Relationship qualifier must be a string')
        .isIn(['biological', 'adoptive', 'step', 'foster', 'in-law'])
        .withMessage('Invalid relationship qualifier')
        .custom((value, { req }) => {
            // For spouse relationships, certain qualifiers don't make sense
            if (req.body.relationship_type === 'spouse' && 
                ['biological', 'adoptive', 'foster'].includes(value)) {
                throw new Error(`'${value}' is not a valid qualifier for spouse relationships`);
            }
            
            // For parent/child relationships, 'in-law' doesn't make sense
            if (['parent', 'child'].includes(req.body.relationship_type) && 
                value === 'in-law') {
                throw new Error(`'in-law' is not a valid qualifier for ${req.body.relationship_type} relationships`);
            }
            
            return true;
        }),
    
    body('start_date')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && req.body.end_date && new Date(value) >= new Date(req.body.end_date)) {
                throw new Error('Start date must be before end date');
            }
            return true;
        }),
    
    body('end_date')
        .optional()
        .isISO8601().withMessage('End date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
    
    // Custom validation for specific relationship types
    body()
        .custom((value) => {
            // For spouse relationships, start_date (marriage date) is required
            if (value.relationship_type === 'spouse' && !value.start_date) {
                throw new Error('Marriage date (start_date) is required for spouse relationships');
            }
            return true;
        })
];

/**
 * Validation rules for updating a relationship
 */
exports.updateRelationshipValidation = [
    param('relationshipId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('relationship_type')
        .optional()
        .isString().withMessage('Relationship type must be a string')
        .isIn(['parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild', 'aunt/uncle', 'niece/nephew', 'cousin'])
        .withMessage('Invalid relationship type'),
    
    body('relationship_qualifier')
        .optional()
        .isString().withMessage('Relationship qualifier must be a string')
        .isIn(['biological', 'adoptive', 'step', 'foster', 'in-law'])
        .withMessage('Invalid relationship qualifier'),
    
    body('start_date')
        .optional()
        .isISO8601().withMessage('Start date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && req.body.end_date && new Date(value) >= new Date(req.body.end_date)) {
                throw new Error('Start date must be before end date');
            }
            return true;
        }),
    
    body('end_date')
        .optional()
        .isISO8601().withMessage('End date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
];

/**
 * Validation for relationship ID parameter
 */
exports.relationshipIdValidation = [
    param('relationshipId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for getting relationships by person ID
 */
exports.getRelationshipsByPersonValidation = [
    param('personId')
        .isUUID().withMessage(errorMessages.uuid)
];
