const stripeService = require('../services/stripeService');
const { getApiErrorMessage } = require('../utils/errorUtils');

const paymentController = {
    /**
     * Handles Stripe webhook events.
     * This endpoint receives events directly from Stripe.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    handleStripeWebhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            // Use raw body for webhook signature verification
            event = stripeService.stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            await stripeService.handleWebhookEvent(event);
            res.json({ received: true });
        } catch (error) {
            console.error('Error processing Stripe webhook event:', error);
            res.status(500).json({ message: getApiErrorMessage(error) });
        }
    },

    /**
     * Retrieves the status of a Stripe Payment Intent.
     * Useful for frontend polling or reconciliation.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getPaymentIntentStatus: async (req, res) => {
        try {
            const { paymentIntentId } = req.params;
            const paymentIntent = await stripeService.retrievePaymentIntent(paymentIntentId);
            res.status(200).json({
                id: paymentIntent.id,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata,
            });
        } catch (error) {
            console.error('Error in getPaymentIntentStatus:', error);
            res.status(404).json({ message: getApiErrorMessage(error) });
        }
    },
};

module.exports = paymentController;
