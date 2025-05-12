const { Project, UserEvent, User } = require('../models');
const { Op } = require('sequelize');

// Get dashboard summary
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get project count for the user
        const projectCount = await Project.count({
            include: [{
                model: User,
                where: { user_id: userId },
                attributes: []
            }]
        });
        
        // Get recent activity
        const recentActivity = await UserEvent.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 10,
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        });
        
        res.json({
            projectCount,
            recentActivity
        });
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        res.status(500).json({ message: 'Server error retrieving dashboard summary' });
    }
};

// Get user events (formerly notifications)
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const notifications = await UserEvent.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        });
        
        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error retrieving notifications' });
    }
};
