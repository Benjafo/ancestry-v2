const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');
const { User, Role } = require('../models');

// Mock data for testing
const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    first_name: 'Test',
    last_name: 'User'
};

let authToken;

// Setup and teardown
beforeAll(async () => {
    // Sync database and create roles
    await sequelize.sync({ force: true });
    
    // Create roles
    await Role.bulkCreate([
        {
            name: 'client',
            description: 'Regular user who purchases genealogy research services'
        },
        {
            name: 'manager',
            description: 'Administrator who manages client data and research'
        }
    ]);
});

afterAll(async () => {
    // Clean up database
    await sequelize.close();
});

describe('Authentication API', () => {
    
    // Test registrationa
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('user_id');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user.first_name).toBe(testUser.first_name);
            expect(response.body.user.last_name).toBe(testUser.last_name);
        });
        
        it('should not register a user with an existing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exists');
        });
    });
    
    // Test login
    describe('POST /api/auth/login', () => {
        it('should login an existing user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('roles');
            expect(response.body.user.roles).toContain('client');
            
            // Save token for protected route tests
            authToken = response.body.token;
        });
        
        it('should not login with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
    
    // Test protected routes
    describe('GET /api/auth/profile', () => {
        it('should access profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUser.email);
        });
        
        it('should not access profile without token', async () => {
            const response = await request(app)
                .get('/api/auth/profile');
            
            expect(response.status).toBe(401);
        });
        
        it('should not access profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalidtoken');
            
            expect(response.status).toBe(401);
        });
    });
});
