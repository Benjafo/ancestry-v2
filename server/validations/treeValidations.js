const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new tree
 */
exports.createTreeValidation = [
    body('name')
        .notEmpty().withMessage(errorMessages.required('Name'))
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

/**
 * Validation rules for updating a tree
 */
exports.updateTreeValidation = [
    param('treeId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('name')
        .optional()
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

/**
 * Validation rules for assigning a user to a tree
 */
exports.assignUserToTreeValidation = [
    param('treeId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('userId')
        .notEmpty().withMessage(errorMessages.required('User ID'))
        .isUUID().withMessage(errorMessages.uuid),
    
    body('accessLevel')
        .notEmpty().withMessage(errorMessages.required('Access level'))
        .isIn(['view', 'edit']).withMessage(errorMessages.enum('Access level', ['view', 'edit']))
];

/**
 * Validation for tree ID parameter
 */
exports.treeIdValidation = [
    param('treeId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for removing a user from a tree
 */
exports.removeUserFromTreeValidation = [
    param('treeId')
        .isUUID().withMessage(errorMessages.uuid),
    
    param('userId')
        .isUUID().withMessage(errorMessages.uuid)
];
