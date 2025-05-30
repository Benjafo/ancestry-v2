const { body, param } = require('express-validator');
const { Order, ServicePackage } = require('../models'); // Import models to check existence

const orderValidations = {
    createOrder: [
        body('servicePackageId')
            .notEmpty().withMessage('Service package ID is required.')
            .isUUID().withMessage('Service package ID must be a valid UUID.')
            .custom(async (value) => {
                const servicePackage = await ServicePackage.findByPk(value);
                if (!servicePackage || !servicePackage.is_active) {
                    throw new Error('Selected service package is invalid or not active.');
                }
                return true;
            }),
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
