const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use individual environment variables
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(
        process.env.DATABASE_URL,
        {
            dialect: 'postgres',
            logging: false
        })
    : new Sequelize({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

// Test the connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {
    sequelize,
    testConnection
};
