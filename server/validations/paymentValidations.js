const { param } = require('express-validator');

const paymentValidations = {
    getPaymentIntentStatus: [
        param('paymentIntentId')
            .notEmpty().withMessage('Payment Intent ID is required.')
            .isString().withMessage('Payment Intent ID must be a string.'),
    ],
    // Webhook validation is handled by Stripe's constructEvent, not express-validator
};

module.exports = paymentValidations;
