const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { email, password, first_name, last_name } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const user = await User.create({
            email,
            password, // Will be hashed by the model hook
            first_name,
            last_name
        });
        
        // Assign default client role
        const clientRole = await Role.findOne({ where: { name: 'client' } });
        await user.addRole(clientRole);
        
        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ 
            where: { email },
            include: Role
        });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Validate password
        const isPasswordValid = await user.validPassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Update last login
        user.last_login = new Date();
        await user.save();
        
        // Get user roles
        const roles = user.Roles.map(role => role.name);
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email,
                roles
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                roles
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            include: Role,
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const roles = user.Roles.map(role => role.name);
        
        res.status(200).json({
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                roles
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};
