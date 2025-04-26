const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Mock data for client profiles
const clientProfiles = {
    // This would be stored in the database in a real application
    profiles: {}
};

/**
 * @route   GET /api/client/profile
 * @desc    Get client profile
 * @access  Private
 */
router.get('/profile', verifyToken, (req, res) => {
    const userId = req.user.user_id;
    
    // Check if profile exists
    if (!clientProfiles.profiles[userId]) {
        // Create a default profile if it doesn't exist
        clientProfiles.profiles[userId] = {
            user_id: userId,
            phone: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            country: '',
            preferences: {
                emailNotifications: true,
                researchUpdates: true
            }
        };
    }
    
    res.json({ profile: clientProfiles.profiles[userId] });
});

/**
 * @route   PUT /api/client/profile
 * @desc    Update client profile
 * @access  Private
 */
router.put('/profile', verifyToken, (req, res) => {
    const userId = req.user.user_id;
    const { phone, address, city, state, zip_code, country, preferences } = req.body;
    
    // Create or update profile
    if (!clientProfiles.profiles[userId]) {
        clientProfiles.profiles[userId] = { user_id: userId };
    }
    
    // Update fields
    if (phone !== undefined) clientProfiles.profiles[userId].phone = phone;
    if (address !== undefined) clientProfiles.profiles[userId].address = address;
    if (city !== undefined) clientProfiles.profiles[userId].city = city;
    if (state !== undefined) clientProfiles.profiles[userId].state = state;
    if (zip_code !== undefined) clientProfiles.profiles[userId].zip_code = zip_code;
    if (country !== undefined) clientProfiles.profiles[userId].country = country;
    
    // Update preferences
    if (preferences) {
        if (!clientProfiles.profiles[userId].preferences) {
            clientProfiles.profiles[userId].preferences = {};
        }
        
        if (preferences.emailNotifications !== undefined) {
            clientProfiles.profiles[userId].preferences.emailNotifications = preferences.emailNotifications;
        }
        
        if (preferences.researchUpdates !== undefined) {
            clientProfiles.profiles[userId].preferences.researchUpdates = preferences.researchUpdates;
        }
    }
    
    res.json({ 
        message: 'Profile updated successfully',
        profile: clientProfiles.profiles[userId]
    });
});

module.exports = router;
