const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Import the models
const { User, Role, Project, ProjectDocument, ProjectTimeline } = require('./models');

async function seedDatabase() {
    // First connect to the default 'postgres' database
    console.log('Connecting to the target database...');
    console.log(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);
    const adminSequelize = new Sequelize(
        process.env.DATABASE_URL.replace('/ancestrydb', '/postgres'),
        {
            // host: process.env.DB_HOST,
            // port: process.env.DB_PORT,
            // username: process.env.DB_USER,
            // password: process.env.DB_PASSWORD,
            // database: 'postgres', // Connect to default postgres database
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false
        }
    );

    let sequelize;

    try {
        console.log('Starting database seeding process...');
        
        // Create the database if it doesn't exist
        console.log('Checking if database exists...');
        const [results] = await adminSequelize.query(`
            SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'
        `);
        
        if (results.length === 0) {
            console.log(`Database '${process.env.DB_NAME}' does not exist. Creating...`);
            await adminSequelize.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database '${process.env.DB_NAME}' created successfully.`);
        } else {
            console.log(`Database '${process.env.DB_NAME}' already exists.`);
        }
        
        // Close the admin connection
        await adminSequelize.close();
        
        // Now connect to the target database
        sequelize = new Sequelize(
            process.env.DATABASE_URL,
            {
                // host: process.env.DB_HOST,
                // port: process.env.DB_PORT,
                // username: process.env.DB_USER,
                // password: process.env.DB_PASSWORD,
                // database: process.env.DB_NAME,
                dialect: 'postgres',
                logging: process.env.NODE_ENV === 'development' ? console.log : false
            }
        );
        
        // Start a transaction to ensure data consistency
        const transaction = await sequelize.transaction();

        try {
            // Drop all existing tables (optional if using CASCADE in schema.sql)
            console.log('Dropping existing tables...');
            await sequelize.query(`
                DROP TABLE IF EXISTS document_persons CASCADE;
                DROP TABLE IF EXISTS documents CASCADE;
                DROP TABLE IF EXISTS events CASCADE;
                DROP TABLE IF EXISTS relationships CASCADE;
                DROP TABLE IF EXISTS persons CASCADE;
                DROP TABLE IF EXISTS user_roles CASCADE;
                DROP TABLE IF EXISTS users CASCADE;
                DROP TABLE IF EXISTS roles CASCADE;
                DROP TABLE IF EXISTS projects CASCADE;
                DROP TABLE IF EXISTS project_users CASCADE;
                DROP TABLE IF EXISTS project_documents CASCADE;
                DROP TABLE IF EXISTS project_timelines CASCADE;
                DROP TABLE IF EXISTS client_profiles CASCADE;
                DROP TABLE IF EXISTS notifications CASCADE;
                DROP TABLE IF EXISTS activities CASCADE;
                DROP TABLE IF EXISTS password_reset_tokens CASCADE;
            `, { transaction });

            // Read schema.sql
            console.log('Reading schema file...');
            const schemaPath = '/app/schema.sql';
            const schema = fs.readFileSync(schemaPath, 'utf8');

            // Execute schema.sql using raw query
            console.log('Recreating database tables...');
            await sequelize.query(schema, { transaction });
            console.log('Database schema recreated successfully');

            // Create roles using Sequelize models
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

            // Create users using Sequelize models
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

            // Create test data for admin user
            console.log('Creating test data for admin user...');

            // Create three research projects managed by the admin
            const project1 = await Project.create({
                title: 'Smith Family Immigration Records',
                description: 'Research project to trace Smith family immigration patterns from Ireland to the United States',
                status: 'active',
                researcher_id: adminUser.user_id
            }, { transaction });

            /* const project2 = */ await Project.create({
                title: 'Johnson European Ancestry',
                description: 'Investigation into Johnson family roots in Scandinavia and Germany',
                status: 'active',
                researcher_id: adminUser.user_id
            }, { transaction });

            /* const project3 = */ await Project.create({
                title: 'Williams Military Service',
                description: 'Documentation of Williams family members who served in various military conflicts',
                status: 'on_hold',
                researcher_id: adminUser.user_id
            }, { transaction });
            
            console.log('Admin projects created successfully');

            // Add documents to the first project
            await ProjectDocument.create({
                project_id: project1.id,
                title: 'Ship Passenger Manifest',
                type: 'document',
                file_path: '/documents/manifest.pdf'
            }, { transaction });

            await ProjectDocument.create({
                project_id: project1.id,
                title: 'Birth Certificate',
                type: 'certificate',
                file_path: '/documents/birth_certificate.pdf'
            }, { transaction });
            
            console.log('Project documents created successfully');

            // Add timeline events to the first project
            await ProjectTimeline.create({
                project_id: project1.id,
                date: new Date('1892-04-15'),
                event: 'Arrival at Ellis Island',
                description: 'First Smith family members arrived in the United States through Ellis Island'
            }, { transaction });

            await ProjectTimeline.create({
                project_id: project1.id,
                date: new Date('1895-06-22'),
                event: 'Settlement in Boston',
                description: 'Smith family established their first home in Boston, Massachusetts'
            }, { transaction });
            
            console.log('Project timeline events created successfully');

            // Assign project to client user
            console.log('Assigning project to client user...');
            
            // Assign project to the client user with view access
            await sequelize.query(`
                INSERT INTO project_users (project_id, user_id, access_level, created_at, updated_at)
                VALUES ('${project1.id}', '${clientUser.user_id}', 'view', NOW(), NOW())
            `, { transaction });
            
            console.log('Client project assignment completed successfully');

            // Commit the transaction
            await transaction.commit();
            console.log('Database seeding completed successfully');
        } catch (error) {
            // Rollback the transaction if there was an error
            await transaction.rollback();
            throw error; // Re-throw to be caught by the outer catch block
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Ensure all connections are closed
        try {
            if (adminSequelize && adminSequelize.close) {
                await adminSequelize.close();
            }
            if (sequelize && sequelize.close) {
                await sequelize.close();
            }
        } catch (e) {
            console.error('Error closing database connections:', e);
        }
        console.log('Database connections closed');
    }
}

// Execute the seed function
seedDatabase();
