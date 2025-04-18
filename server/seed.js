const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

async function seedDatabase() {
    // First connect to the default 'postgres' database
    const adminSequelize = new Sequelize({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres', // Connect to default postgres database
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    });

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
        sequelize = new Sequelize({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false
        });

        // Drop all existing tables (optional if using CASCADE in schema.sql)
        console.log('Dropping existing tables...');
        await sequelize.query(`
      DROP TABLE IF EXISTS document_persons CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS relationships CASCADE;
      DROP TABLE IF EXISTS persons CASCADE;
    `);

        // Read schema.sql
        console.log('Reading schema file...');
        const schemaPath = '/app/schema.sql';
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema.sql using raw query
        console.log('Recreating database tables...');
        await sequelize.query(schema);
        console.log('Database schema recreated successfully');

        // ==========================================
        // PLACEHOLDER: Seed data for persons table
        // ==========================================
        /*
        console.log('Seeding persons table...');
        await sequelize.query(`
          INSERT INTO persons (person_id, first_name, last_name, gender, birth_date)
          VALUES 
            (uuid_generate_v4(), 'John', 'Doe', 'Male', '1950-01-01'),
            (uuid_generate_v4(), 'Jane', 'Doe', 'Female', '1952-05-15');
        `);
        */

        // ==========================================
        // PLACEHOLDER: Seed data for relationships table
        // ==========================================
        /*
        console.log('Seeding relationships table...');
        await sequelize.query(`
          INSERT INTO relationships (relationship_id, person1_id, person2_id, relationship_type)
          VALUES 
            (uuid_generate_v4(), (SELECT person_id FROM persons WHERE first_name = 'John'), 
             (SELECT person_id FROM persons WHERE first_name = 'Jane'), 'spouse');
        `);
        */

        // ==========================================
        // PLACEHOLDER: Seed data for events table
        // ==========================================
        /*
        console.log('Seeding events table...');
        await sequelize.query(`
          INSERT INTO events (event_id, person_id, event_type, event_date)
          VALUES 
            (uuid_generate_v4(), (SELECT person_id FROM persons WHERE first_name = 'John'), 
             'marriage', '1975-06-12');
        `);
        */

        // ==========================================
        // PLACEHOLDER: Seed data for documents table
        // ==========================================
        /*
        console.log('Seeding documents table...');
        await sequelize.query(`
          INSERT INTO documents (document_id, title, document_type, upload_date)
          VALUES 
            (uuid_generate_v4(), 'Marriage Certificate', 'certificate', NOW());
        `);
        */

        // ==========================================
        // PLACEHOLDER: Seed data for document_persons junction table
        // ==========================================
        /*
        console.log('Seeding document_persons table...');
        await sequelize.query(`
          INSERT INTO document_persons (document_id, person_id)
          VALUES 
            ((SELECT document_id FROM documents WHERE title = 'Marriage Certificate'),
             (SELECT person_id FROM persons WHERE first_name = 'John')),
            ((SELECT document_id FROM documents WHERE title = 'Marriage Certificate'),
             (SELECT person_id FROM persons WHERE first_name = 'Jane'));
        `);
        */

        console.log('Database seeding completed successfully');

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
