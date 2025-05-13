const { Project, UserEvent, User, Document, Person, Role, ProjectPerson, DocumentPerson } = require('../models');
const { Op } = require('sequelize');

// Get dashboard summary
exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Check if user is a manager
        const userRoles = await Role.findAll({
            include: [{
                model: User,
                where: { user_id: userId },
                attributes: []
            }],
            attributes: ['name']
        });
        
        const isManager = userRoles.some(role => role.name === 'manager');
        
        let projectCount, documentCount, personCount;
        
        if (isManager) {
            // For managers, count all projects, documents, and persons
            projectCount = await Project.count();
            documentCount = await Document.count();
            personCount = await Person.count();
        } else {
            // For regular clients, only count associated items
            projectCount = await Project.count({
                include: [{
                    model: User,
                    where: { user_id: userId },
                    attributes: []
                }]
            });
            
            // Get user's projects
            const userProjects = await Project.findAll({
                include: [{
                    model: User,
                    where: { user_id: userId },
                    attributes: []
                }],
                attributes: ['id']
            });
            
            const projectIds = userProjects.map(project => project.id);
            
            // Count documents and persons associated with user's projects
            if (projectIds.length > 0) {
                // Get persons associated with these projects
                const projectPersons = await ProjectPerson.findAll({
                    where: { project_id: projectIds },
                    attributes: ['person_id']
                });
                
                const personIds = projectPersons.map(pp => pp.person_id);
                personCount = new Set(personIds).size;
                
                // Count documents associated with these persons
                if (personIds.length > 0) {
                    const documentPersons = await DocumentPerson.findAll({
                        where: { person_id: personIds },
                        attributes: ['document_id']
                    });
                    
                    documentCount = new Set(documentPersons.map(dp => dp.document_id)).size;
                } else {
                    documentCount = 0;
                }
            } else {
                documentCount = 0;
                personCount = 0;
            }
        }
        
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
