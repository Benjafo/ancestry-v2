const { Project, ProjectDocument, ProjectTimeline, User } = require('../models');

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            attributes: { include: ['created_at', 'updated_at'] }
        });
        
        // Ensure timestamps are included in the response
        const projectsWithDates = projects.map(project => {
            const projectJson = project.toJSON();
            return {
                ...projectJson,
                created_at: projectJson.created_at,
                updated_at: projectJson.updated_at
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
        
        const project = await Project.findByPk(id, {
            attributes: { include: ['created_at', 'updated_at'] },
            include: [
                {
                    model: User,
                    as: 'researcher',
                    attributes: ['user_id', 'first_name', 'last_name', 'email']
                },
                {
                    model: ProjectDocument,
                    as: 'documents'
                },
                {
                    model: ProjectTimeline,
                    as: 'timeline'
                }
            ]
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Ensure timestamps are included in the response
        const projectJson = project.toJSON();
        const projectWithDates = {
            ...projectJson,
            created_at: projectJson.created_at,
            updated_at: projectJson.updated_at
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
        
        const project = await Project.findByPk(id, {
            attributes: { include: ['created_at', 'updated_at'] }
        });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
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
