const { Project, Notification, Activity, User } = require('../models');
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
        const recentActivity = await Activity.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 10
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

// Get notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const notifications = await Notification.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });
        
        res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error retrieving notifications' });
    }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;
        
        const notification = await Notification.findOne({
            where: {
                id,
                user_id: userId
            }
        });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        notification.is_read = true;
        await notification.save();
        
        res.json({
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: 'Server error updating notification' });
    }
};
