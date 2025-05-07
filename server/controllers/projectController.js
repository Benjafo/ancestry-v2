const { Project, User, Person, Event, Document } = require('../models');
const { Sequelize } = require('sequelize');

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        let projects;
        
        // Check if user is a manager
        const isManager = req.user.roles.includes('manager');
        
        if (isManager) {
            // Managers can see all projects
            projects = await Project.findAll({
                attributes: { include: ['created_at', 'updated_at'] }
            });
        } else {
            // Clients can only see projects they're assigned to
            const user = await User.findByPk(req.user.user_id, {
                include: [{
                    model: Project,
                    through: { attributes: ['access_level'] }
                }]
            });
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Extract projects from user
            projects = user.Projects || [];
        }
        
        // Ensure timestamps are included in the response
        const projectsWithDates = projects.map(project => {
            const projectJson = project.toJSON();
            return {
                ...projectJson,
                created_at: projectJson.created_at,
                updated_at: projectJson.updated_at,
                // Include access_level if available (for clients)
                access_level: projectJson.project_users?.access_level || 'view'
            };
        });
        
        res.json({ projects: projectsWithDates });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error retrieving projects' });
    }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is a manager
        const isManager = req.user.roles.includes('manager');
        
        // Find the project with basic information and researcher
        const project = await Project.findByPk(id, {
            attributes: { include: ['created_at', 'updated_at'] },
            include: [
                {
                    model: User,
                    as: 'researcher',
                    attributes: ['user_id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Person,
                    as: 'persons',
                    through: { attributes: [] }, // Exclude junction table attributes
                    include: [
                        {
                            model: Document,
                            as: 'documents',
                            through: { attributes: [] } // Exclude junction table attributes
                        },
                        {
                            model: Event,
                            as: 'events',
                            through: { attributes: ['role', 'notes'] } // Include role from junction table
                        }
                    ]
                },
                {
                    model: Event,
                    as: 'events',
                    through: { attributes: [] } // Exclude junction table attributes
                }
            ]
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // If user is not a manager, check if they have access to this project
        if (!isManager) {
            const userProject = await Project.findOne({
                where: { id },
                include: [{
                    model: User,
                    where: { user_id: req.user.user_id },
                    through: { attributes: ['access_level'] }
                }]
            });
            
            if (!userProject) {
                return res.status(403).json({ message: 'You do not have access to this project' });
            }
            
            // Add access level to the project
            project.access_level = userProject.Users[0].project_users.access_level;
        }
        
        // Process the project data to match frontend expectations
        const projectJson = project.toJSON();
        
        // Collect all documents from all persons in the project
        const documents = [];
        if (projectJson.persons && projectJson.persons.length > 0) {
            projectJson.persons.forEach(person => {
                if (person.documents && person.documents.length > 0) {
                    person.documents.forEach(doc => {
                        // Add person information to the document
                        documents.push({
                            ...doc,
                            person_name: `${person.first_name} ${person.last_name}`,
                            person_id: person.person_id
                        });
                    });
                }
            });
        }
        
        // Collect all events (both from project and from persons)
        const timeline = [];
        
        // Add events directly associated with the project
        if (projectJson.events && projectJson.events.length > 0) {
            projectJson.events.forEach(event => {
                timeline.push({
                    ...event,
                    event: event.event_type,
                    date: event.event_date,
                    associated_with: 'project'
                });
            });
        }
        
        // Add events from persons in the project
        if (projectJson.persons && projectJson.persons.length > 0) {
            projectJson.persons.forEach(person => {
                if (person.events && person.events.length > 0) {
                    person.events.forEach(event => {
                        timeline.push({
                            ...event,
                            event: event.event_type,
                            date: event.event_date,
                            person_name: `${person.first_name} ${person.last_name}`,
                            person_id: person.person_id,
                            associated_with: 'person',
                            role: event.person_events?.role || 'primary'
                        });
                    });
                }
            });
        }
        
        // Sort timeline by date
        timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Create the final project object
        const projectWithDates = {
            ...projectJson,
            created_at: projectJson.created_at,
            updated_at: projectJson.updated_at,
            access_level: project.access_level || 'view',
            documents: documents,
            timeline: timeline
        };
        
        res.json(projectWithDates);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Server error retrieving project' });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // Check if user exists
        const user = await User.findByPk(req.user.user_id);
        
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found. Please log out and log in again.' 
            });
        }
        
        const project = await Project.create({
            title,
            description,
            status: 'active',
            researcher_id: req.user.user_id // Assign current user as researcher
        });
        
        // Ensure timestamps are included in the response
        const projectJson = project.toJSON();
        const projectWithDates = {
            ...projectJson,
            created_at: projectJson.created_at,
            updated_at: projectJson.updated_at
        };
        
        res.status(201).json({
            message: 'Project created successfully',
            project: projectWithDates
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Server error creating project' });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        
        // Check if user is a manager
        const isManager = req.user.roles.includes('manager');
        
        // Find the project
        const project = await Project.findByPk(id, {
            attributes: { include: ['created_at', 'updated_at'] }
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // If user is not a manager, check if they have edit access to this project
        if (!isManager) {
            const userProject = await Project.findOne({
                where: { id },
                include: [{
                    model: User,
                    where: { user_id: req.user.user_id },
                    through: { 
                        where: { access_level: 'edit' },
                        attributes: ['access_level'] 
                    }
                }]
            });
            
            if (!userProject) {
                return res.status(403).json({ message: 'You do not have edit access to this project' });
            }
        }
        
        // Update fields
        if (title) project.title = title;
        if (description) project.description = description;
        if (status) project.status = status;
        
        await project.save();
        
        // Ensure timestamps are included in the response
        const projectJson = project.toJSON();
        const projectWithDates = {
            ...projectJson,
            created_at: projectJson.created_at,
            updated_at: projectJson.updated_at
        };
        
        res.json({
            message: 'Project updated successfully',
            project: projectWithDates
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Server error updating project' });
    }
};
