const { body, param } = require('express-validator');

const servicePackageValidations = {
    createServicePackage: [
        body('name')
            .notEmpty().withMessage('Package name is required.')
            .isString().withMessage('Package name must be a string.')
            .trim()
            .isLength({ min: 3, max: 255 }).withMessage('Package name must be between 3 and 255 characters.'),
        body('description')
            .optional()
            .isString().withMessage('Description must be a string.'),
        body('price_cents')
            .notEmpty().withMessage('Price is required.')
            .isInt({ min: 0 }).withMessage('Price must be a non-negative integer (in cents).'),
        body('currency')
            .notEmpty().withMessage('Currency is required.')
            .isString().withMessage('Currency must be a string.')
            .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code (e.g., usd).'),
        body('features')
            .optional()
            .isArray().withMessage('Features must be an array.')
            .custom((value) => {
                if (!Array.isArray(value)) return false;
                if (value.some(feature => typeof feature !== 'string' || feature.trim().length === 0)) {
                    throw new Error('Each feature must be a non-empty string.');
                }
                return true;
            }),
        body('estimated_delivery_weeks')
            .optional()
            .isInt({ min: 1 }).withMessage('Estimated delivery weeks must be a positive integer.'),
        body('is_active')
            .optional()
            .isBoolean().withMessage('Is active must be a boolean.'),
        body('sort_order')
            .optional()
            .isInt().withMessage('Sort order must be an integer.'),
    ],

    updateServicePackage: [
        param('id')
            .notEmpty().withMessage('Service package ID is required.')
            .isUUID().withMessage('Service package ID must be a valid UUID.'),
        body('name')
            .optional()
            .isString().withMessage('Package name must be a string.')
            .trim()
            .isLength({ min: 3, max: 255 }).withMessage('Package name must be between 3 and 255 characters.'),
        body('description')
            .optional()
            .isString().withMessage('Description must be a string.'),
        body('price_cents')
            .optional()
            .isInt({ min: 0 }).withMessage('Price must be a non-negative integer (in cents).'),
        body('currency')
            .optional()
            .isString().withMessage('Currency must be a string.')
            .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code (e.g., usd).'),
        body('features')
            .optional()
            .isArray().withMessage('Features must be an array.')
            .custom((value) => {
                if (!Array.isArray(value)) return false;
                if (value.some(feature => typeof feature !== 'string' || feature.trim().length === 0)) {
                    throw new Error('Each feature must be a non-empty string.');
                }
                return true;
            }),
        body('estimated_delivery_weeks')
            .optional()
            .isInt({ min: 1 }).withMessage('Estimated delivery weeks must be a positive integer.'),
        body('is_active')
            .optional()
            .isBoolean().withMessage('Is active must be a boolean.'),
        body('sort_order')
            .optional()
            .isInt().withMessage('Sort order must be an integer.'),
    ],

    getServicePackageById: [
        param('id')
            .notEmpty().withMessage('Service package ID is required.')
            .isUUID().withMessage('Service package ID must be a valid UUID.'),
    ],

    deactivateReactivateServicePackage: [
        param('id')
            .notEmpty().withMessage('Service package ID is required.')
            .isUUID().withMessage('Service package ID must be a valid UUID.'),
    ],
};

module.exports = servicePackageValidations;
