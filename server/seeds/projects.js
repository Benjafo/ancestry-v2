const { Project, ProjectUser } = require('../models');

/**
 * Seeds the projects table and project-user associations
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing users
 * @param {Object} params.adminUser - Admin user
 * @param {Object} params.clientUser - Client user
 * @returns {Promise<Object>} Created projects
 */
async function seedProjects(transaction, { adminUser, clientUser }) {
    console.log('Creating test data for admin user...');

    // Create three research projects managed by the admin
    const project1 = await Project.create({
        title: 'Smith Family Immigration Records',
        description: 'Research project to trace Smith family immigration patterns from Ireland to the United States',
        status: 'active',
        researcher_id: adminUser.user_id
    }, { transaction });

    const project2 = await Project.create({
        title: 'Johnson European Ancestry',
        description: 'Investigation into Johnson family roots in Scandinavia and Germany',
        status: 'active',
        researcher_id: adminUser.user_id
    }, { transaction });

    const project3 = await Project.create({
        title: 'Williams Military Service',
        description: 'Documentation of Williams family members who served in various military conflicts',
        status: 'on_hold',
        researcher_id: adminUser.user_id
    }, { transaction });
    
    console.log('Admin projects created successfully');

    // Assign project to client user
    console.log('Assigning project to client user...');
    
    // Assign project to the client user with view access
    await ProjectUser.create({
        project_id: project1.id,
        user_id: clientUser.user_id,
        access_level: 'view'
    }, { transaction });
    
    console.log('Client project assignment completed successfully');

    return {
        project1,
        project2,
        project3
    };
}

module.exports = seedProjects;
