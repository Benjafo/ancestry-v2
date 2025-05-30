const { Order, ServicePackage, User, Project, OrderProject } = require('../models');
const { sequelize } = require('../models');
const { createProject } = require('./projectService');
const { createNewUserAndAssignRole } = require('./userService'); // For auto-user creation
const stripeService = require('./stripeService'); // To retrieve payment intent status

const orderService = {
    /**
     * Creates a new order and initiates a Stripe Payment Intent.
     * This function is called from the frontend checkout process.
     * @param {string} servicePackageId - The ID of the selected service package.
     * @param {string} [userId] - The ID of the authenticated user. Null if new user.
     * @param {object} customerInfo - Details provided by the customer (name, email, etc.).
     * @returns {Promise<object>} - Contains client_secret, orderId, and publishableKey.
     */
    createOrderAndPaymentIntent: async (servicePackageId, userId, customerInfo) => {
        const transaction = await sequelize.transaction();
        try {
            const servicePackage = await ServicePackage.findByPk(servicePackageId, { transaction });
            if (!servicePackage || !servicePackage.is_active) {
                throw new Error('Service package not found or is not active.');
            }

            // Use stripeService to create the payment intent and the pending order
            const { client_secret, orderId, publishableKey } = await stripeService.createPaymentIntent(
                servicePackageId,
                userId,
                customerInfo
            );

            await transaction.commit();
            return { client_secret, orderId, publishableKey };
        } catch (error) {
            await transaction.rollback();
            console.error('Error in orderService.createOrderAndPaymentIntent:', error);
            throw error;
        }
    },

    /**
     * Updates the status of an order.
     * This is primarily called by the Stripe webhook handler.
     * @param {string} orderId - The ID of the order to update.
     * @param {string} newStatus - The new status for the order.
     * @param {object} [options] - Optional parameters like transaction.
     * @returns {Promise<Order>} - The updated order object.
     */
    updateOrderStatus: async (orderId, newStatus, options = {}) => {
        const { transaction } = options;
        const order = await Order.findByPk(orderId, { transaction });

        if (!order) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }

        if (order.status === newStatus) {
            console.log(`Order ${order.id} already has status ${newStatus}. No update needed.`);
            return order;
        }

        const oldStatus = order.status;
        order.status = newStatus;
        await order.save({ transaction });

        // Event logging will be handled by the controller

        return order;
    },

    /**
     * Retrieves order details by ID.
     * @param {string} orderId - The ID of the order.
     * @param {string} requestingUserId - The ID of the user requesting the order (for access control).
     * @param {boolean} isAdmin - True if the requesting user is an admin.
     * @returns {Promise<Order>} - The order object with associated data.
     */
    getOrderDetails: async (orderId, requestingUserId, isAdmin) => {
        const order = await Order.findByPk(orderId, {
            include: [
                { model: ServicePackage, as: 'servicePackage' },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name', 'email'] },
                { model: OrderProject, as: 'orderProject', include: [{ model: Project, as: 'project' }] }
            ]
        });

        if (!order) {
            throw new Error('Order not found.');
        }

        // Access control: Only the owner or an admin can view the order
        if (!isAdmin && order.user_id !== requestingUserId) {
            throw new Error('Unauthorized access to order details.');
        }

        return order;
    },

    /**
     * Links a successfully paid order to a newly created project.
     * This is typically called by the Stripe webhook handler.
     * @param {string} orderId - The ID of the order.
     * @param {string} servicePackageId - The ID of the service package.
     * @param {string} customerEmail - The email of the customer.
     * @param {object} customerInfo - Full customer info from the order.
     * @param {object} [options] - Optional parameters like transaction.
     * @returns {Promise<Project>} - The newly created project.
     */
    linkOrderToProject: async (orderId, servicePackageId, customerEmail, customerInfo, options = {}) => {
        const { transaction } = options;
        let user = await User.findOne({ where: { email: customerEmail }, transaction });
        let userId = user ? user.user_id : null;

        // If user doesn't exist, create a new client user
        if (!user) {
            console.log(`User with email ${customerEmail} not found. Creating new client user.`);
            const { first_name, last_name } = customerInfo;
            if (!first_name || !last_name) {
                throw new Error('Missing first_name or last_name for new user creation.');
            }
            user = await createNewUserAndAssignRole({
                email: customerEmail,
                first_name,
                last_name,
            }, 'client', transaction);
            userId = user.user_id;

            // Update the order with the newly created user's ID
            const order = await Order.findByPk(orderId, { transaction });
            if (order) {
                order.user_id = userId;
                await order.save({ transaction });
            }
        }

        const servicePackage = await ServicePackage.findByPk(servicePackageId, { transaction });
        const projectTitle = `Research Project for ${customerInfo.first_name} ${customerInfo.last_name} - ${servicePackage ? servicePackage.name : 'Custom Service'}`;
        const projectDescription = `Project initiated from order ${orderId} for service: ${servicePackage ? servicePackage.name : 'N/A'}. Customer notes: ${customerInfo.special_requests || 'None'}`;

        const newProject = await createProject({
            title: projectTitle,
            description: projectDescription,
            status: 'active',
            client_user_id: userId,
            service_package_id: servicePackageId,
        }, transaction);

        await OrderProject.create({
            order_id: orderId,
            project_id: newProject.id,
        }, { transaction });

        // TODO: Send confirmation email to client
        // TODO: Send notification email to assigned researcher

        return newProject;
    },

    /**
     * Gets a list of orders for a specific user or all orders for admin.
     * @param {string} userId - The ID of the user whose orders to retrieve.
     * @param {boolean} isAdmin - True if the requesting user is an admin.
     * @param {object} [pagination] - Pagination options (page, limit).
     * @param {object} [filters] - Filtering options (status, servicePackageId).
     * @param {object} [sort] - Sorting options (sortBy, sortOrder).
     * @returns {Promise<object>} - Paginated list of orders.
     */
    getOrders: async (userId, isAdmin, pagination = {}, filters = {}, sort = {}) => {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (!isAdmin) {
            whereClause.user_id = userId;
        }
        if (filters.status) {
            whereClause.status = filters.status;
        }
        if (filters.servicePackageId) {
            whereClause.service_package_id = filters.servicePackageId;
        }

        const orderClause = [];
        if (sort.sortBy && sort.sortOrder) {
            orderClause.push([sort.sortBy, sort.sortOrder.toUpperCase()]);
        } else {
            orderClause.push(['created_at', 'DESC']); // Default sort
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: orderClause,
            include: [
                { model: ServicePackage, as: 'servicePackage' },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name', 'email'] },
                { model: OrderProject, as: 'orderProject', include: [{ model: Project, as: 'project' }] }
            ]
        });

        return {
            orders: rows,
            metadata: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    },

    /**
     * Manually updates an order's status (admin only).
     * @param {string} orderId - The ID of the order.
     * @param {string} newStatus - The new status.
     * @param {string} adminUserId - The ID of the admin performing the update.
     * @returns {Promise<Order>} - The updated order.
     */
    adminUpdateOrderStatus: async (orderId, newStatus, adminUserId) => {
        const transaction = await sequelize.transaction();
        try {
            const order = await orderService.updateOrderStatus(orderId, newStatus, { transaction });

            await createEvent(
                adminUserId,
                adminUserId,
                'order_status_manual_update',
                `Admin updated order ${order.id} status to ${newStatus}.`,
                order.id,
                'order',
                transaction
            );

            await transaction.commit();
            return order;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in orderService.adminUpdateOrderStatus:', error);
            throw error;
        }
    },
};

module.exports = orderService;
