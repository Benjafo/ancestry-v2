const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new user
 */
exports.createUserValidation = [
    body('email')
        .isEmail().withMessage(errorMessages.email)
        .notEmpty().withMessage(errorMessages.required('Email')),
    
    body('password')
        .isLength({ min: 8 }).withMessage(errorMessages.minLength('Password', 8))
        .notEmpty().withMessage(errorMessages.required('Password')),
    
    body('first_name')
        .notEmpty().withMessage(errorMessages.required('First name')),
    
    body('last_name')
        .notEmpty().withMessage(errorMessages.required('Last name')),
    
    body('role')
        .isIn(['client', 'manager']).withMessage('Role must be either "client" or "manager"')
        .notEmpty().withMessage(errorMessages.required('Role'))
];

/**
 * Validation rules for updating a user
 */
exports.updateUserValidation = [
    param('userId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('first_name')
        .optional()
        .notEmpty().withMessage('First name cannot be empty if provided'),
    
    body('last_name')
        .optional()
        .notEmpty().withMessage('Last name cannot be empty if provided'),
    
    body('role')
        .optional()
        .isIn(['client', 'manager']).withMessage('Role must be either "client" or "manager"')
];

/**
 * Validation for client ID parameter
 */
exports.clientIdValidation = [
    param('clientId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for project ID parameter
 */
exports.projectIdValidation = [
    param('projectId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for user ID parameter
 */
exports.userIdValidation = [
    param('userId')
        .isUUID().withMessage(errorMessages.uuid)
];
