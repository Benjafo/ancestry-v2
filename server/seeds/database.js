const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

/**
 * Seeds the database schema
 * @param {Object} sequelize - Sequelize instance
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<void>}
 */
async function seedDatabase(sequelize, transaction) {
    console.log('Setting up database schema...');

    // Drop all existing tables (optional if using CASCADE in schema.sql)
    console.log('Dropping existing tables...');
    await sequelize.query(`
        DROP TABLE IF EXISTS document_persons CASCADE;
        DROP TABLE IF EXISTS person_events CASCADE;
        DROP TABLE IF EXISTS project_events CASCADE;
        DROP TABLE IF EXISTS documents CASCADE;
        DROP TABLE IF EXISTS events CASCADE;
        DROP TABLE IF EXISTS relationships CASCADE;
        DROP TABLE IF EXISTS persons CASCADE;
        DROP TABLE IF EXISTS user_roles CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS roles CASCADE;
        DROP TABLE IF EXISTS projects CASCADE;
        DROP TABLE IF EXISTS project_persons CASCADE;
        DROP TABLE IF EXISTS project_users CASCADE;
        DROP TABLE IF EXISTS client_profiles CASCADE;
        DROP TABLE IF EXISTS user_events CASCADE;
        DROP TABLE IF EXISTS password_reset_tokens CASCADE;
        DROP TABLE IF EXISTS service_packages CASCADE;
        DROP TABLE IF EXISTS orders CASCADE;
        DROP TABLE IF EXISTS order_projects CASCADE;
    `, { transaction });
    console.log('Tables dropped successfully');

    try {
        // Read schema.sql
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        console.log(`Looking for schema file at: ${schemaPath}`);
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log(`Schema file loaded, size: ${schema.length} bytes`);

        // Execute schema.sql using raw query
        console.log('Recreating database tables...');
        await sequelize.query(schema, { transaction });
        console.log('Database schema recreated successfully');

        // Read constraints.sql
        console.log('Reading constraints file...');
        const constraintsPath = path.join(__dirname, '..', 'constraints.sql');
        console.log(`Looking for constraints file at: ${constraintsPath}`);
        const constraints = fs.readFileSync(constraintsPath, 'utf8');
        console.log(`Constraints file loaded, size: ${constraints.length} bytes`);

        // Execute constraints.sql using raw query
        console.log('Adding database constraints...');
        await sequelize.query(constraints, { transaction });
        console.log('Database constraints added successfully');
    } catch (error) {
        console.error('Error reading or executing SQL files:', error);
        throw error;
    }
}

module.exports = seedDatabase;
