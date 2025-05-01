const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new person
 */
exports.createPersonValidation = [
    body('first_name')
        .notEmpty().withMessage(errorMessages.required('First name'))
        .isString().withMessage('First name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
    
    body('middle_name')
        .optional()
        .isString().withMessage('Middle name must be a string')
        .isLength({ max: 100 }).withMessage('Middle name cannot exceed 100 characters'),
    
    body('last_name')
        .notEmpty().withMessage(errorMessages.required('Last name'))
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
    
    body('maiden_name')
        .optional()
        .isString().withMessage('Maiden name must be a string')
        .isLength({ max: 100 }).withMessage('Maiden name cannot exceed 100 characters'),
    
    body('gender')
        .optional()
        .isString().withMessage('Gender must be a string')
        .isIn(['male', 'female', 'other', 'unknown']).withMessage('Gender must be one of: male, female, other, unknown'),
    
    body('birth_date')
        .optional()
        .isISO8601().withMessage('Birth date must be a valid date in ISO 8601 format')
        .custom((value) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Birth date cannot be in the future');
            }
            return true;
        }),
    
    body('birth_location')
        .optional()
        .isString().withMessage('Birth location must be a string')
        .isLength({ max: 255 }).withMessage('Birth location cannot exceed 255 characters'),
    
    body('death_date')
        .optional()
        .isISO8601().withMessage('Death date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Death date cannot be in the future');
            }
            
            if (value && req.body.birth_date && new Date(value) <= new Date(req.body.birth_date)) {
                throw new Error('Death date must be after birth date');
            }
            
            return true;
        }),
    
    body('death_location')
        .optional()
        .isString().withMessage('Death location must be a string')
        .isLength({ max: 255 }).withMessage('Death location cannot exceed 255 characters'),
    
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
];

/**
 * Validation rules for updating a person
 */
exports.updatePersonValidation = [
    param('personId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('first_name')
        .optional()
        .notEmpty().withMessage('First name cannot be empty if provided')
        .isString().withMessage('First name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
    
    body('middle_name')
        .optional()
        .isString().withMessage('Middle name must be a string')
        .isLength({ max: 100 }).withMessage('Middle name cannot exceed 100 characters'),
    
    body('last_name')
        .optional()
        .notEmpty().withMessage('Last name cannot be empty if provided')
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
    
    body('maiden_name')
        .optional()
        .isString().withMessage('Maiden name must be a string')
        .isLength({ max: 100 }).withMessage('Maiden name cannot exceed 100 characters'),
    
    body('gender')
        .optional()
        .isString().withMessage('Gender must be a string')
        .isIn(['male', 'female', 'other', 'unknown']).withMessage('Gender must be one of: male, female, other, unknown'),
    
    body('birth_date')
        .optional()
        .isISO8601().withMessage('Birth date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Birth date cannot be in the future');
            }
            
            if (value && req.body.death_date && new Date(value) >= new Date(req.body.death_date)) {
                throw new Error('Birth date must be before death date');
            }
            
            return true;
        }),
    
    body('birth_location')
        .optional()
        .isString().withMessage('Birth location must be a string')
        .isLength({ max: 255 }).withMessage('Birth location cannot exceed 255 characters'),
    
    body('death_date')
        .optional()
        .isISO8601().withMessage('Death date must be a valid date in ISO 8601 format')
        .custom((value, { req }) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Death date cannot be in the future');
            }
            
            if (value && req.body.birth_date && new Date(value) <= new Date(req.body.birth_date)) {
                throw new Error('Death date must be after birth date');
            }
            
            return true;
        }),
    
    body('death_location')
        .optional()
        .isString().withMessage('Death location must be a string')
        .isLength({ max: 255 }).withMessage('Death location cannot exceed 255 characters'),
    
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string')
];

/**
 * Validation for person ID parameter
 */
exports.personIdValidation = [
    param('personId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for adding a person to a project
 */
exports.addPersonToProjectValidation = [
    param('projectId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('person_id')
        .isUUID().withMessage(errorMessages.uuid)
];
