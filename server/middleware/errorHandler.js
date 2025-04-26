/**
 * Global error handling middleware
 */

// Development error handler - includes stack trace
const developmentErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        message: err.message,
        error: {
            status: statusCode,
            stack: err.stack
        }
    });
};

// Production error handler - no stack traces leaked to user
const productionErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        message: err.message,
        error: {
            status: statusCode
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
