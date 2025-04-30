const { Project, ProjectDocument, ProjectTimeline, User } = require('../models');

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll();
        res.json({ projects });
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
        
        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Server error retrieving project' });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const project = await Project.create({
            title,
            description,
            status: 'active',
            researcher_id: req.user.user_id // Assign current user as researcher
        });
        
        res.status(201).json({
            message: 'Project created successfully',
            project
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
        
        const project = await Project.findByPk(id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Update fields
        if (title) project.title = title;
        if (description) project.description = description;
        if (status) project.status = status;
        
        await project.save();
        
        res.json({
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Server error updating project' });
    }
};
