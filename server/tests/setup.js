// Load environment variables
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Set test JWT secret if not already set
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test_jwt_secret';
}

// Set test database connection if not already set
// if (!process.env.DATABASE_URL) {
    // process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/ancestry_test';
// }
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/ancestrydb';
}

// Global setup
jest.setTimeout(30000); // Increase timeout for database operations
