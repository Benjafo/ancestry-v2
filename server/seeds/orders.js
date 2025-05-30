const { Order, Project } = require('../models');
const orderService = require('../services/orderService');

/**
 * Seeds sample orders into the database.
 * @param {Object} transaction - The Sequelize transaction.
 * @param {Object} options - Options for seeding.
 * @param {Object} options.clientUser - The client user to associate with orders.
 * @param {Object} options.servicePackages - Array of service packages.
 * @returns {Promise<void>}
 */
async function seedOrders(transaction, { clientUser, servicePackages }) {
    console.log('Seeding orders...');

    if (!clientUser || !servicePackages || servicePackages.length === 0) {
        console.warn('Skipping order seeding: clientUser or servicePackages not provided.');
        return;
    }

    const basicPackage = servicePackages.find(p => p.name === 'Basic Research Package');
    const comprehensivePackage = servicePackages.find(p => p.name === 'Comprehensive Research Package');

    if (!basicPackage || !comprehensivePackage) {
        console.warn('Skipping order seeding: Required service packages not found.');
        return;
    }

    // Create a pending order
    const pendingOrder = await Order.create({
        user_id: clientUser.id,
        service_package_id: basicPackage.id,
        status: 'pending',
        total_amount: basicPackage.price,
        customer_info: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: clientUser.email,
            phone: '555-123-4567',
            address: '123 Main St',
            city: 'Anytown',
            state: 'NY',
            zip: '12345',
            specialRequests: 'Focus on maternal line.',
            familyInfo: 'Mother: Alice, Father: Bob'
        },
        stripe_payment_intent_id: null, // No payment intent yet for pending
    }, { transaction });
    console.log(`Created pending order: ${pendingOrder.id}`);

    // Create a paid order (simulating a successful payment)
    // This will also trigger project creation and user event logging
    const paidOrder = await Order.create({
        user_id: clientUser.id,
        service_package_id: comprehensivePackage.id,
        status: 'paid',
        total_amount: comprehensivePackage.price,
        customer_info: {
            firstName: 'John',
            lastName: 'Smith',
            email: clientUser.email,
            phone: '555-987-6543',
            address: '456 Oak Ave',
            city: 'Otherville',
            state: 'CA',
            zip: '98765',
            specialRequests: 'Need detailed records from Europe.',
            familyInfo: 'Grandfather: Charles, Grandmother: Dorothy'
        },
        stripe_payment_intent_id: `pi_seed_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
    }, { transaction });
    console.log(`Created paid order: ${paidOrder.id}`);

    // Simulate the webhook processing for the paid order
    // This would normally happen via the Stripe webhook, but we simulate it here for seeding
    await orderService.handleSuccessfulPayment(paidOrder.stripe_payment_intent_id, transaction);
    console.log(`Simulated successful payment for order: ${paidOrder.id}`);

    // Create a completed order (simulating a completed project)
    const completedOrder = await Order.create({
        user_id: clientUser.id,
        service_package_id: basicPackage.id,
        status: 'completed',
        total_amount: basicPackage.price,
        customer_info: {
            firstName: 'Emily',
            lastName: 'White',
            email: clientUser.email,
            phone: '555-111-2222',
            address: '789 Pine Ln',
            city: 'Smalltown',
            state: 'TX',
            zip: '77777',
            specialRequests: 'Looking for ancestors from the 1800s.',
            familyInfo: 'Great-grandmother: Sarah'
        },
        stripe_payment_intent_id: `pi_seed_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_completed`,
    }, { transaction });
    console.log(`Created completed order: ${completedOrder.id}`);

    // Simulate the webhook processing for the completed order
    await orderService.handleSuccessfulPayment(completedOrder.stripe_payment_intent_id, transaction);
    console.log(`Simulated successful payment for completed order: ${completedOrder.id}`);

    // Manually update the project status to completed for the completed order's project
    const completedOrderProject = await Project.findOne({
        where: {
            name: `Research Project for Order ${completedOrder.id}`
        },
        transaction
    });

    if (completedOrderProject) {
        await completedOrderProject.update({ status: 'completed' }, { transaction });
        console.log(`Updated project ${completedOrderProject.id} to completed for order ${completedOrder.id}`);
    }

    console.log('Orders seeded successfully.');
}

module.exports = seedOrders;
