const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth'); // Assuming verifyToken exists
const bodyParser = require('body-parser'); // Required for raw body parsing for webhooks

// Stripe webhook endpoint - requires raw body for signature verification
// This middleware must come before express.json() or express.urlencoded()
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// Route to get payment intent status (protected, can be used by client or admin)
router.get('/status/:paymentIntentId', verifyToken, paymentController.getPaymentIntentStatus);

module.exports = router;
