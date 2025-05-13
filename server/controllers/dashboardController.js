const { Project, UserEvent, User, Document, Person } = require('../models');
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
        
        // Get document count from user's projects
        const userProjects = await Project.findAll({
            include: [{
                model: User,
                where: { user_id: userId },
                attributes: []
            }],
            attributes: ['id']
        });
        
        const projectIds = userProjects.map(project => project.id);
        
        // Count documents associated with the user's projects
        const documentCount = projectIds.length > 0 ? await Document.count({
            include: [{
                model: Project,
                where: { id: projectIds },
                attributes: []
            }]
        }) : 0;
        
        // Count persons associated with the user's projects
        const personCount = projectIds.length > 0 ? await Person.count({
            include: [{
                model: Project,
                where: { id: projectIds },
                attributes: []
            }]
        }) : 0;
        
        res.json({
            projectCount,
            documentCount,
            personCount
        });
    } catch (error) {
        console.error('Get dashboard summary error:', error);
        res.status(500).json({ message: 'Server error retrieving dashboard summary' });
    }
};

// Get user events
exports.getUserEvents = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        const userEvents = await UserEvent.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        });
        
        res.json({ userEvents });
    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({ message: 'Server error retrieving user events' });
    }
};
