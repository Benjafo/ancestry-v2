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

    // Create 12 test users
    console.log('Creating 12 test users...');
    const testUsers = [];

    for (let i = 1; i <= 12; i++) {
        const testUser = await User.create({
            email: `test${i}@example.com`,
            password: 'Password123', // Will be hashed by model hooks
            first_name: `Test ${i}`,
            last_name: 'Test'
        }, { transaction });
        
        // Assign client role to test user
        await testUser.addRole(clientRole, { transaction });
        
        testUsers.push(testUser);
    }
    
    console.log('Test users created successfully with password: Password123');

    // Assign roles to users using Sequelize associations
    console.log('Assigning roles to users...');
    await adminUser.addRole(managerRole, { transaction });
    await clientUser.addRole(clientRole, { transaction });
    console.log('User roles assigned successfully');

    return {
        adminUser,
        clientUser,
        testUsers,
        managerRole,
        clientRole
    };
}

module.exports = seedUsers;
