const { ValidationError } = require('sequelize'); // Import ValidationError

/**
 * Global error handling middleware
 */

// Central function to process different error types
const handleAppError = (err) => {
    let error = { ...err }; // Create a mutable copy
    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Something went wrong!';

    console.log('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack
    });

    // Handle Sequelize Validation Errors
    if (error.name === 'SequelizeValidationError') {
        error.statusCode = 400; // Bad Request for validation errors
        const messages = error.errors.map(el => el.message);
        error.message = `Validation failed: ${messages.join('. ')}`;
    }
    // Add other specific error handlers here if needed (e.g., unique constraint errors)

    // For operational errors (like AppError instances), keep their status and message
    if (error.isOperational) { // Assuming AppError sets this
        // Already handled by AppError constructor
    } else if (error.statusCode === 500 && process.env.NODE_ENV === 'production') {
        // In production, hide generic 500 error details
        error.message = 'Something went very wrong!';
    }

    return error;
};

// Development error handler - includes stack trace
const developmentErrorHandler = (err, req, res, next) => {
    const processedError = handleAppError(err); // Process the error

    res.status(processedError.statusCode).json({
        message: processedError.message,
        error: {
            status: processedError.statusCode,
            stack: processedError.stack // Include stack in dev
        }
    });
};

// Production error handler - no stack traces leaked to user
const productionErrorHandler = (err, req, res, next) => {
    const processedError = handleAppError(err); // Process the error

    res.status(processedError.statusCode).json({
        message: processedError.message,
        error: {
            status: processedError.statusCode // No stack in prod
        }
    });
};

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Not found error handler
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(err);
};

// Export error handlers based on environment
module.exports = {
    errorHandler: process.env.NODE_ENV === 'production'
        ? productionErrorHandler
        : developmentErrorHandler,
    notFoundHandler,
    AppError
};
