const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Creates a connection to the database
 * @returns {Promise<Sequelize>} Sequelize instance
 */
const connectToDatabase = async () => {
    console.log('Connecting to the target database...');
    console.log(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);

    return new Sequelize(
        process.env.DATABASE_URL,
        {
            dialect: 'postgres',
            logging: false
        }
    );
};

/**
 * Creates a connection to the admin database (postgres)
 * @returns {Promise<Sequelize>} Sequelize instance
 */
const connectToAdminDatabase = async () => {
    return new Sequelize(
        process.env.DATABASE_URL.replace('/ancestrydb', '/postgres'),
        {
            dialect: 'postgres',
            logging: false
        }
    );
};

/**
 * Creates the database if it doesn't exist
 * @returns {Promise<void>}
 */
const createDatabaseIfNotExists = async () => {
    const adminSequelize = await connectToAdminDatabase();

    try {
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
    } finally {
        await adminSequelize.close();
    }
};

// These functions are now handled by the database.js module

/**
 * Logs a section header to the console
 * @param {string} message - Message to log
 */
const logSection = (message) => {
    console.log('\n' + '='.repeat(80));
    console.log(`  ${message}`);
    console.log('='.repeat(80) + '\n');
};

/**
 * Runs a seed function with proper error handling
 * @param {Function} seedFn - Seed function to run
 * @param {string} name - Name of the seed function
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<any>} Result of the seed function
 */
const runSeed = async (seedFn, name, transaction) => {
    logSection(`Running seed: ${name}`);
    try {
        const result = await seedFn(transaction);
        console.log(`Seed ${name} completed successfully.`);
        return result;
    } catch (error) {
        console.error(`Error in seed ${name}:`, error);
        throw error;
    }
};

module.exports = {
    connectToDatabase,
    connectToAdminDatabase,
    createDatabaseIfNotExists,
    logSection,
    runSeed
};
