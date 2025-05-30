const stripeService = require('../services/stripeService');
const UserEventService = require('../services/userEventService'); // Import UserEventService

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
            event = stripeService.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            const { type, data } = event;
            const paymentIntent = data.object;
            const orderId = paymentIntent.metadata.order_id;
            const userId = paymentIntent.metadata.user_id; // User who initiated the payment

            await stripeService.handleWebhookEvent(event); // This updates the order status and creates project/user

            // Log events based on webhook type
            switch (type) {
                case 'payment_intent.succeeded':
                    await UserEventService.createEvent(
                        userId, // Actor is the user who made the payment
                        userId,
                        'service_purchased',
                        `Payment succeeded for order ${orderId}.`,
                        orderId,
                        'order'
                    );
                    break;
                case 'payment_intent.payment_failed':
                    await UserEventService.createEvent(
                        userId,
                        userId,
                        'payment_failed',
                        `Payment failed for order ${orderId}. Reason: ${paymentIntent.last_payment_error ? paymentIntent.last_payment_error.message : 'N/A'}`,
                        orderId,
                        'order'
                    );
                    break;
                case 'charge.refunded':
                    await UserEventService.createEvent(
                        userId,
                        userId,
                        'payment_refunded',
                        `Payment for order ${orderId} was refunded.`,
                        orderId,
                        'order'
                    );
                    break;
                case 'payment_intent.created':
                    // Payment Intent created, no action needed as order is already 'pending' in our DB
                    console.log(`Stripe event: PaymentIntent ${paymentIntent.id} created for order ${orderId}.`);
                    break;
                // Handle other event types as needed
                default:
                    console.log(`Unhandled Stripe event type: ${type}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Error processing Stripe webhook event:', error);
            res.status(500).json({ message: error });
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
            res.status(404).json({ message: error });
        }
    },
};

module.exports = paymentController;
