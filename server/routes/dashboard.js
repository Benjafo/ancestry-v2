const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Mock data for dashboard
const dashboardData = {
    // This would be fetched from the database in a real application
    summary: {
        projectCount: 3,
        recentActivity: [
            {
                id: '1',
                type: 'update',
                description: 'New document added to Smith family tree',
                date: '2025-04-20T14:30:00Z'
            },
            {
                id: '2',
                type: 'discovery',
                description: 'Found birth certificate for John Smith (1856)',
                date: '2025-04-18T09:15:00Z'
            },
            {
                id: '3',
                type: 'update',
                description: 'Updated information for Sarah Johnson',
                date: '2025-04-15T16:45:00Z'
            }
        ]
    },
    notifications: [
        {
            id: '1',
            title: 'Research Update',
            message: 'Your genealogist has made progress on your family tree',
            isRead: false,
            date: '2025-04-21T10:00:00Z'
        },
        {
            id: '2',
            title: 'New Document',
            message: 'A new document has been added to your research project',
            isRead: true,
            date: '2025-04-19T08:30:00Z'
        }
    ]
};

/**
 * @route   GET /api/dashboard/summary
 * @desc    Get dashboard summary data
 * @access  Private
 */
router.get('/summary', verifyToken, (req, res) => {
    res.json(dashboardData.summary);
});

/**
 * @route   GET /api/dashboard/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', verifyToken, (req, res) => {
    res.json({ notifications: dashboardData.notifications });
});

/**
 * @route   PUT /api/dashboard/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', verifyToken, (req, res) => {
    const notificationId = req.params.id;
    
    // Find and update the notification
    const notification = dashboardData.notifications.find(n => n.id === notificationId);
    
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    
    res.json({ 
        message: 'Notification marked as read',
        notification
    });
});

module.exports = router;
