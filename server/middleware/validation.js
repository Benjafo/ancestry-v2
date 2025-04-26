const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of express-validator validation rules
 * @returns {Function} Express middleware function
 */
exports.validate = (validations) => {
    return async (req, res, next) => {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        
        // Check if there are validation errors
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // Format errors for response
            const formattedErrors = errors.array().reduce((acc, error) => {
                const field = error.path;
                if (!acc[field]) {
                    acc[field] = [];
                }
                acc[field].push(error.msg);
                return acc;
            }, {});
            
            return res.status(400).json({
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
        
        next();
    };
};

/**
 * Common validation error messages
 */
exports.errorMessages = {
    required: field => `${field} is required`,
    minLength: (field, length) => `${field} must be at least ${length} characters`,
    maxLength: (field, length) => `${field} cannot exceed ${length} characters`,
    email: 'Please provide a valid email address',
    uuid: 'Invalid ID format',
    boolean: field => `${field} must be a boolean value`,
    enum: (field, values) => `${field} must be one of: ${values.join(', ')}`,
    date: field => `${field} must be a valid date`,
    numeric: field => `${field} must be a number`,
    integer: field => `${field} must be an integer`,
    min: (field, value) => `${field} must be at least ${value}`,
    max: (field, value) => `${field} cannot exceed ${value}`
};
