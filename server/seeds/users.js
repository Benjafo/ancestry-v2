const { User, Role } = require('../models');

/**
 * Seeds the users and roles tables
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} Created users and roles
 */
async function seedUsers(transaction) {
    console.log('Seeding roles table...');
    const clientRole = await Role.create({
        name: 'client',
        description: 'Regular user who purchases genealogy research services'
    }, { transaction });
    
    const managerRole = await Role.create({
        name: 'manager',
        description: 'Administrator who manages client data and research'
    }, { transaction });
    
    console.log('Roles seeded successfully');

    console.log('Seeding users table...');
    const adminUser = await User.create({
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by model hooks
        first_name: 'Admin',
        last_name: 'User'
    }, { transaction });
    
    const clientUser = await User.create({
        email: 'client@example.com',
        password: 'password123', // Will be hashed by model hooks
        first_name: 'Test',
        last_name: 'Client'
    }, { transaction });
    
    console.log('Users seeded successfully with password: password123');

    // Assign roles to users using Sequelize associations
    console.log('Assigning roles to users...');
    await adminUser.addRole(managerRole, { transaction });
    await clientUser.addRole(clientRole, { transaction });
    console.log('User roles assigned successfully');

    return {
        adminUser,
        clientUser,
        managerRole,
        clientRole
    };
}

module.exports = seedUsers;
