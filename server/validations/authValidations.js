const { body } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for user registration
 */
exports.registerValidation = [
    body('email')
        .notEmpty().withMessage(errorMessages.required('Email'))
        .isEmail().withMessage(errorMessages.email)
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage(errorMessages.required('Password'))
        .isLength({ min: 8 }).withMessage(errorMessages.minLength('Password', 8))
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('first_name')
        .notEmpty().withMessage(errorMessages.required('First name'))
        .isString().withMessage('First name must be a string')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('last_name')
        .notEmpty().withMessage(errorMessages.required('Last name'))
        .isString().withMessage('Last name must be a string')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
];

/**
 * Validation rules for user login
 */
exports.loginValidation = [
    body('email')
        .notEmpty().withMessage(errorMessages.required('Email'))
        .isEmail().withMessage(errorMessages.email)
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage(errorMessages.required('Password'))
];

/**
 * Validation rules for token refresh
 */
exports.refreshTokenValidation = [
    body('refreshToken')
        .notEmpty().withMessage(errorMessages.required('Refresh token'))
];

/**
 * Validation rules for password reset request
 */
exports.requestPasswordResetValidation = [
    body('email')
        .notEmpty().withMessage(errorMessages.required('Email'))
        .isEmail().withMessage(errorMessages.email)
        .normalizeEmail()
];

/**
 * Validation rules for password reset
 */
exports.resetPasswordValidation = [
    body('token')
        .notEmpty().withMessage(errorMessages.required('Reset token')),
    
    body('password')
        .notEmpty().withMessage(errorMessages.required('Password'))
        .isLength({ min: 8 }).withMessage(errorMessages.minLength('Password', 8))
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];
