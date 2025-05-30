const Stripe = require('stripe');
const { Order, Project, User, OrderProject, UserEvent } = require('../models'); // Removed ServicePackage
const { sequelize } = require('../config/database'); // Import sequelize instance for transactions
const { createProject } = require('./projectService'); // Assuming this service exists
const { createNewUserAndAssignRole } = require('./userService'); // Assuming this service exists for auto-user creation

// Initialize Stripe with secret key from environment variables
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const stripeService = {
    /**
     * Creates a Stripe Payment Intent for a given Stripe Product ID.
     * @param {string} stripeProductId - The ID of the Stripe Product.
     * @param {string} userId - The ID of the user initiating the payment (can be null for new users).
     * @param {object} customerInfo - Customer details from the checkout form.
     * @returns {Promise<object>} - Contains client_secret and orderId.
     */
    createPaymentIntent: async (stripeProductId, userId, customerInfo) => {
        const transaction = await sequelize.transaction();
        try {
            // Retrieve product and its default price directly from Stripe
            const product = await stripe.products.retrieve(stripeProductId, {
                expand: ['default_price'],
            });

            if (!product || !product.active || !product.default_price || !product.default_price.active) {
                throw new Error('Stripe Product not found, not active, or has no active price.');
            }

            const price = product.default_price;

            // Create a pending order in our database
            const order = await Order.create({
                user_id: userId, // Can be null if user is not logged in (auto-create user later)
                stripe_product_id: stripeProductId, // Store Stripe Product ID
                status: 'pending',
                total_amount_cents: price.unit_amount,
                currency: price.currency,
                customer_info: customerInfo,
            }, { transaction });

            const paymentIntent = await stripe.paymentIntents.create({
                amount: price.unit_amount,
                currency: price.currency,
                metadata: {
                    order_id: order.id,
                    stripe_product_id: stripeProductId, // Include Stripe Product ID in metadata for webhook
                    user_id: userId, // Include user_id in metadata for webhook
                },
                // Add payment_method_types if you want to restrict payment methods
                // payment_method_types: ['card'],
            }, { idempotencyKey: order.id, }); // Use order ID as idempotency key

            order.stripe_payment_intent_id = paymentIntent.id;
            await order.save({ transaction });

            await transaction.commit();

            return {
                client_secret: paymentIntent.client_secret,
                orderId: order.id,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating payment intent:', error);
            throw error;
        }
    },

    /**
     * Handles Stripe webhook events.
     * @param {object} event - The Stripe event object.
     * @returns {Promise<void>}
     */
    handleWebhookEvent: async (event) => {
        const transaction = await sequelize.transaction();
        try {
            const { type, data } = event;
            const paymentIntent = data.object;

            const orderId = paymentIntent.metadata.order_id;
            const stripeProductId = paymentIntent.metadata.stripe_product_id; // Use stripeProductId
            let userId = paymentIntent.metadata.user_id; // This might be null if user was new

            if (!orderId) {
                console.warn('Webhook received for payment intent without order_id in metadata:', paymentIntent.id);
                await transaction.rollback();
                return;
            }

            const order = await Order.findByPk(orderId, { transaction });

            if (!order) {
                console.error(`Order with ID ${orderId} not found for payment intent ${paymentIntent.id}`);
                await transaction.rollback();
                return;
            }

            // Idempotency check: If order is already succeeded/completed, do nothing
            if (order.status === 'succeeded' || order.status === 'completed') {
                console.log(`Order ${order.id} already processed with status ${order.status}. Skipping webhook.`);
                await transaction.rollback();
                return;
            }

            switch (type) {
                case 'payment_intent.succeeded':
                    order.status = 'succeeded';
                    await order.save({ transaction });

                    console.log(`PaymentIntent ${paymentIntent.id} succeeded for order ${order.id}`);

                    // Auto-create user if userId was null (new customer)
                    let user = await User.findByPk(userId, { transaction });
                    if (!user) {
                        console.log('User not found, attempting to create new user from customer_info');
                        const { email, first_name, last_name } = order.customer_info;
                        if (!email || !first_name || !last_name) {
                            throw new Error('Missing customer info for new user creation.');
                        }
                        // This function should create a user and assign 'client' role
                        user = await createNewUserAndAssignRole({
                            email,
                            first_name,
                            last_name,
                            // A temporary password will be generated and sent via email
                        }, 'client', transaction);
                        userId = user.user_id; // Update userId for order and project
                        order.user_id = userId;
                        await order.save({ transaction });
                    }

                    // Create a new project for the order
                    // Retrieve product details from Stripe for project title/description
                    const product = await stripe.products.retrieve(stripeProductId, { transaction });
                    const projectTitle = `Research Project for ${order.customer_info.first_name} ${order.customer_info.last_name} - ${product ? product.name : 'Custom Service'}`;
                    const projectDescription = `Project initiated from order ${order.id} for service: ${product ? product.name : 'N/A'}. Customer notes: ${order.customer_info.special_requests || 'None'}`;

                    // Assuming createProject handles default researcher assignment and ProjectUser creation
                    const newProject = await createProject({
                        title: projectTitle,
                        description: projectDescription,
                        status: 'active',
                        client_user_id: userId, // Pass client user ID for association
                        stripe_product_id: stripeProductId, // Link project to Stripe Product ID
                    }, transaction);

                    // Link order to project
                    await OrderProject.create({
                        order_id: order.id,
                        project_id: newProject.id,
                    }, { transaction });

                    // TODO: Send confirmation email to client
                    // TODO: Send notification email to assigned researcher

                    break;
                case 'payment_intent.payment_failed':
                    order.status = 'failed';
                    await order.save({ transaction });
                    console.log(`PaymentIntent ${paymentIntent.id} failed for order ${order.id}. Reason: ${paymentIntent.last_payment_error ? paymentIntent.last_payment_error.message : 'N/A'}`);
                    // Event logging will be handled by the controller
                    break;
                    console.log(`Unhandled event type ${type} for PaymentIntent ${paymentIntent.id}`);
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.error('Error handling Stripe webhook event:', error);
            throw error;
        }
    },

    /**
     * Retrieves a Stripe Payment Intent status.
     * @param {string} paymentIntentId - The ID of the Stripe Payment Intent.
     * @returns {Promise<object>} - The Payment Intent object from Stripe.
     */
    retrievePaymentIntent: async (paymentIntentId) => {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error) {
            console.error('Error retrieving payment intent from Stripe:', error);
            throw error;
        }
    },
    /**
     * New function to list products with their default prices from Stripe.
     * @returns {Promise<Array>} - An array of Stripe Product objects with expanded default_price.
     */
    listProductsWithPrices: async () => {
        try {
            const products = await stripe.products.list({ active: true, expand: ['data.default_price'] });
            // Filter out products that don't have a default_price or where the price is not active
            const productsWithPrices = products.data.filter(product =>
                product.default_price && product.default_price.active
            ).map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                active: product.active,
                metadata: product.metadata,
                prices: [product.default_price], // Attach the default price directly
            }));
            return productsWithPrices;
        } catch (error) {
            console.error('Error listing products with prices from Stripe:', error);
            throw error;
        }
    },
};

module.exports = {
    ...stripeService,
    stripe: stripe
};
