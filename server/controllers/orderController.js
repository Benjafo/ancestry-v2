const orderService = require('../services/orderService');
const UserEventService = require('../services/userEventService'); // Import UserEventService

const orderController = {
    /**
     * Create a new order and initiate a Stripe Payment Intent.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    createOrder: async (req, res) => {
        try {
            const { stripeProductId, customerInfo } = req.body; // Changed from servicePackageId
            const userId = req.user ? req.user.user_id : null; // User ID from authenticated session, can be null for new users

            const { client_secret, orderId, publishableKey } = await orderService.createOrderAndPaymentIntent(
                stripeProductId, // Pass stripeProductId
                userId,
                customerInfo
            );

            res.status(201).json({
                message: 'Order created and payment intent initiated successfully.',
                orderId,
                client_secret,
                publishableKey,
            });
        } catch (error) {
            console.error('Error in createOrder:', error);
            res.status(400).json({ message: error });
        }
    },

    /**
     * Get order details by ID.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getOrderDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.user_id;
            const isAdmin = req.user.roles.includes('manager'); // Assuming 'manager' role is admin

            const order = await orderService.getOrderDetails(id, requestingUserId, isAdmin);
            res.status(200).json(order);
        } catch (error) {
            console.error('Error in getOrderDetails:', error);
            res.status(404).json({ message: error });
        }
    },

    /**
     * Get a list of orders for the authenticated user or all orders for admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getOrders: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const isAdmin = req.user.roles.includes('manager');

            const { page, limit, status, servicePackageId, sortBy, sortOrder } = req.query;

            const pagination = { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 10 };
            const filters = { status, servicePackageId };
            const sort = { sortBy, sortOrder };

            const { orders, metadata } = await orderService.getOrders(userId, isAdmin, pagination, filters, sort);
            res.status(200).json({ orders, metadata });
        } catch (error) {
            console.error('Error in getOrders:', error);
            res.status(500).json({ message: error });
        }
    },

    /**
     * Manually update an order's status (admin only).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    adminUpdateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const adminUserId = req.user.user_id;

            const updatedOrder = await orderService.adminUpdateOrderStatus(id, status, adminUserId);

            await UserEventService.createEvent(
                adminUserId,
                adminUserId,
                'order_status_manual_update',
                `Admin updated order ${updatedOrder.id} status to ${status}.`,
                updatedOrder.id,
                'order'
            );

            res.status(200).json({ message: 'Order status updated successfully.', order: updatedOrder });
        } catch (error) {
            console.error('Error in adminUpdateOrderStatus:', error);
            res.status(400).json({ message: error });
        }
    },
};

module.exports = orderController;
