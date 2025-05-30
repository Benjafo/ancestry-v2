const { body, param } = require('express-validator');
// Removed ServicePackage import as it's no longer directly validated here

const orderValidations = {
    createOrder: [
        body('stripeProductId') // Changed from servicePackageId
            .notEmpty().withMessage('Stripe Product ID is required.')
            .isString().withMessage('Stripe Product ID must be a string.'), // Stripe Product IDs are strings
        body('customerInfo')
            .isObject().withMessage('Customer information must be an object.')
            .notEmpty().withMessage('Customer information cannot be empty.'),
        body('customerInfo.first_name')
            .optional() // Optional if user is logged in, required if new user
            .isString().withMessage('First name must be a string.')
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters.'),
        body('customerInfo.last_name')
            .optional() // Optional if user is logged in, required if new user
            .isString().withMessage('Last name must be a string.')
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters.'),
        body('customerInfo.email')
            .optional() // Optional if user is logged in, required if new user
            .isEmail().withMessage('Invalid email format.')
            .normalizeEmail(),
        // Add more customerInfo validations as needed (e.g., address, phone)
    ],

    getOrderDetails: [
        param('id')
            .notEmpty().withMessage('Order ID is required.')
            .isUUID().withMessage('Order ID must be a valid UUID.'),
    ],

    adminUpdateOrderStatus: [
        param('id')
            .notEmpty().withMessage('Order ID is required.')
            .isUUID().withMessage('Order ID must be a valid UUID.'),
        body('status')
            .notEmpty().withMessage('Status is required.')
            .isIn(['pending', 'succeeded', 'failed', 'refunded', 'processing', 'completed'])
            .withMessage('Invalid order status.'),
    ],
};

module.exports = orderValidations;
