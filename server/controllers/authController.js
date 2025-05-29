const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role, PasswordResetToken } = require('../models');
const { Op } = require('sequelize');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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
        
        // Get user roles
        const roles = ['client']; // Default role for new users
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email,
                roles
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Generate refresh token
        const refreshToken = jwt.sign(
            { 
                user_id: user.user_id,
                email: user.email
            },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            refreshToken,
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                roles
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

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ message: 'Your account is deactivated. Please contact support.' });
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
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Generate refresh token
        const refreshToken = jwt.sign(
            { 
                user_id: user.user_id,
                email: user.email
            },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(200).json({
            message: 'Login successful',
            token,
            refreshToken,
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

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        
        // Find user
        const user = await User.findByPk(decoded.user_id, {
            include: Role
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get user roles
        const roles = user.Roles.map(role => role.name);
        
        // Generate new access token
        const accessToken = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email,
                roles
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            accessToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            // For security reasons, don't reveal that the user doesn't exist
            return res.status(200).json({ 
                message: 'If your email is registered, you will receive a password reset link' 
            });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        
        // Store token in database
        await PasswordResetToken.create({
            token: resetToken,
            user_id: user.user_id,
            expires_at: resetTokenExpiry
        });
        
        // In a real app, send email with reset link
        // For now, just return the token in the response
        res.status(200).json({
            message: 'If your email is registered, you will receive a password reset link',
            // The following would not be included in a production app
            resetToken,
            resetUrl: `${CLIENT_URL}/reset-password?token=${resetToken}`
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        // Check if token exists and is valid
        const resetToken = await PasswordResetToken.findOne({
            where: {
                token,
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });
        
        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        // Find user
        const user = await User.findByPk(resetToken.user_id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update password
        user.password = password; // Will be hashed by the model hook
        await user.save();
        
        // Remove used token
        await resetToken.destroy();
        
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;
        
        // Find user
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Validate current password
        const isPasswordValid = await user.validPassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }
        
        // Update password
        user.password = newPassword; // Will be hashed by the model hook
        await user.save();
        
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
};
