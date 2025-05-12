const { ClientProfile } = require('../models');

// Get client profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        let profile = await ClientProfile.findByPk(userId);
        
        if (!profile) {
            // Create a default profile if it doesn't exist
            profile = await ClientProfile.create({
                user_id: userId,
                email_notifications: true,
                research_updates: true
            });
        }
        
        res.json({ profile });
    } catch (error) {
        console.error('Get client profile error:', error);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

// Update client profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log('Update profile request body:', req.body); // Log the request body
        
        const { 
            phone, address, city, state, zip_code, country, 
            email_notifications, research_updates 
        } = req.body;
        
        let profile = await ClientProfile.findByPk(userId);
        console.log('Found profile:', profile ? 'Yes' : 'No'); // Log if profile was found
        
        if (!profile) {
            // Create profile if it doesn't exist
            profile = await ClientProfile.create({
                user_id: userId
            });
            console.log('Created new profile');
        }
        
        // Log before update
        console.log('Profile before update:', JSON.stringify(profile));
        
        // Update fields
        if (phone !== undefined) profile.phone = phone;
        if (address !== undefined) profile.address = address;
        if (city !== undefined) profile.city = city;
        if (state !== undefined) profile.state = state;
        if (zip_code !== undefined) profile.zip_code = zip_code;
        if (country !== undefined) profile.country = country;
        if (email_notifications !== undefined) profile.email_notifications = email_notifications;
        if (research_updates !== undefined) profile.research_updates = research_updates;
        
        // Log after update
        console.log('Profile after update:', JSON.stringify(profile));
        
        // Save with force option
        await profile.save({ force: true });
        console.log('Profile saved');
        
        res.json({
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Update client profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
