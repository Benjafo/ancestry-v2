const { Project, User, Person, Event, Document, DocumentPerson } = require('../models');
const { Sequelize } = require('sequelize');
const projectService = require('../services/projectService');
const UserEventService = require('../services/userEventService');
const { createEvent } = require('../services/userEventService'); // Import createEvent for direct use

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        let projects;
        const { search, sortBy = 'updated_at', sortOrder = 'desc' } = req.query;

        // Build query options
        const queryOptions = {
            attributes: { include: ['created_at', 'updated_at'] },
            order: [[sortBy, sortOrder.toUpperCase()]]
        };

        // Add search condition if provided
        if (search) {
            queryOptions.where = {
                [Sequelize.Op.or]: [
                    { title: { [Sequelize.Op.iLike]: `%${search}%` } },
                    { description: { [Sequelize.Op.iLike]: `%${search}%` } }
                ]
            };
        }

        // Check if user is a manager
        const isManager = req.user.roles.includes('manager');

        if (isManager) {
            // Managers can see all projects
            projects = await Project.findAll(queryOptions);
        } else {
            // Clients can only see projects they're assigned to
            const user = await User.findByPk(req.user.user_id, {
                include: [{
                    model: Project,
                    through: { attributes: ['access_level'] },
                    ...queryOptions
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
                // Set access_level based on user role
                access_level: isManager ? 'edit' : (projectJson.project_users?.access_level || 'view')
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
                    model: Document,
                    as: 'documents', // This alias correctly refers to documents directly associated with the project
                    required: false // Use left join
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

        // Set access level based on user role
        if (isManager) {
            // Managers always have edit access
            project.access_level = 'edit';
        } else {
            // For regular users, check their specific access level
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

        // Collect all documents (both directly associated with project and through persons)
        const documentsMap = new Map(); // Use a map to store unique documents by ID

        // Add documents directly associated with the project
        if (projectJson.documents && projectJson.documents.length > 0) {
            for (const doc of projectJson.documents) {
                documentsMap.set(doc.document_id, {
                    id: doc.document_id,
                    title: doc.title,
                    type: doc.document_type,
                    uploaded_at: doc.upload_date,
                    persons: [] // Initialize persons array for directly associated documents
                });
            }
        }

        // Add documents associated with persons in the project
        if (projectJson.persons && projectJson.persons.length > 0) {
            for (const person of projectJson.persons) {
                if (person.documents && person.documents.length > 0) {
                    for (const doc of person.documents) {
                        // If the document is not already in the map, add it
                        if (!documentsMap.has(doc.document_id)) {
                            documentsMap.set(doc.document_id, {
                                id: doc.document_id,
                                title: doc.title,
                                type: doc.document_type,
                                uploaded_at: doc.upload_date,
                                persons: []
                            });
                        }

                        // Add the current person to the document's persons array in the map
                        const documentInMap = documentsMap.get(doc.document_id);
                        if (documentInMap && !documentInMap.persons.some(p => p.person_id === person.person_id)) {
                            documentInMap.persons.push({
                                person_id: person.person_id,
                                first_name: person.first_name,
                                last_name: person.last_name,
                            });
                        }
                    }
                }
            }
        }

        // Convert the map values back to an array
        const documents = Array.from(documentsMap.values());


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

        const project = await projectService.createProject({
            title,
            description,
            status: 'active',
            researcher_id: req.user.user_id // Assign current user as researcher
        });

        await UserEventService.createEvent(
            req.user.user_id, // User receiving the event
            req.user.user_id, // Actor (user who created the project)
            'project_created',
            `Created new project: ${title}`,
            project.id,
            'project'
        );

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

        // Check if project is completed - only allow status changes
        if (project.status === 'completed' &&
            ((title !== undefined && title !== project.title) ||
                (description !== undefined && description !== project.description))) {
            return res.status(403).json({
                message: 'Completed projects cannot be modified. You can only change the status.'
            });
        }

        // Store original values for event message
        const originalTitle = project.title;
        const originalStatus = project.status;

        // Update fields
        if (title) project.title = title;
        if (description) project.description = description;
        if (status) project.status = status;

        await project.save();

        // Create user event for project update
        let updateMessage = `Updated project: ${project.title}`;
        if (title && title !== originalTitle) {
            updateMessage += ` (title changed from "${originalTitle}" to "${title}")`;
        }
        if (status && status !== originalStatus) {
            updateMessage += ` (status changed from "${originalStatus}" to "${status}")`;
        }

        // Create event for the actor
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'project_updated',
            updateMessage,
            project.id,
            'project'
        );

        // Create events for all project users
        await UserEventService.createEventForProjectUsers(
            [project.id], // Pass as an array
            req.user.user_id,
            'project_updated',
            `Project "${project.title}" has been updated`,
            project.id, // entity_id is the project's ID
            'project' // entity_type is 'project'
        );


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

// Get all persons in a project
exports.getProjectPersons = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortBy, sortOrder } = req.query;

        // Check if user has access to this project
        await checkProjectAccess(req, id);

        const persons = await projectService.getProjectPersons(id, { sortBy, sortOrder });

        res.json(persons);
    } catch (error) {
        console.error('Get project persons error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('access')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({
            message: 'Server error retrieving project persons',
            error: error.message
        });
    }
};

// Add a person to a project
exports.addPersonToProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { person_id, notes } = req.body;

        // Check if user has edit access to this project
        await checkProjectEditAccess(req, id);

        const association = await projectService.addPersonToProject(id, person_id, { notes });

        // Get person and project details for the event message
        const project = await Project.findByPk(id); // Ensure project is fetched
        const person = await Person.findByPk(person_id); // Ensure person is fetched

        if (project && person) {
            await UserEventService.createEventForProjectUsers(
                [id], // Pass as an array
                req.user.user_id,
                'person_added_to_project',
                `Added ${person.first_name} ${person.last_name} to project: ${project.title}`, // Improved message
                person_id, // entity_id is the person's ID
                'person' // entity_type is 'person'
            );
        }

        res.status(201).json({
            message: 'Person added to project successfully',
            association
        });
    } catch (error) {
        console.error('Add person to project error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('access')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('already in project')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({
            message: 'Server error adding person to project',
            error: error.message
        });
    }
};

// Update a person's association with a project
exports.updateProjectPerson = async (req, res) => {
    try {
        const { id, personId } = req.params;
        const { notes } = req.body;

        // Check if user has edit access to this project
        await checkProjectEditAccess(req, id);

        const association = await projectService.updateProjectPerson(id, personId, { notes });

        // Get person details for the event message
        const { Person } = require('../models');
        const person = await Person.findByPk(personId);

        if (person) {
            if (person) {
                // Create events for all project users
                await UserEventService.createEventForProjectUsers(
                    [id], // Pass as an array
                    req.user.user_id,
                    'person_updated',
                    `Notes updated for ${person.first_name} ${person.last_name} in this project`,
                    personId, // entity_id is the person's ID
                    'person' // entity_type is 'person'
                );
            }
        }

        res.json({
            message: 'Project person updated successfully',
            association
        });
    } catch (error) {
        console.error('Update project person error:', error);

        if (error.message.includes('not found') || error.message.includes('not in project')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('access')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({
            message: 'Server error updating project person',
            error: error.message
        });
    }
};

// Remove a person from a project
exports.removePersonFromProject = async (req, res) => {
    try {
        const { id, personId } = req.params;

        // Check if user has edit access to this project
        await checkProjectEditAccess(req, id);

        await projectService.removePersonFromProject(id, personId);

        // Get person and project details for the event message before they are fully removed
        const project = await Project.findByPk(id); // Ensure project is fetched
        const person = await Person.findByPk(personId); // Ensure person is fetched
        const personName = person ? `${person.first_name} ${person.last_name}` : `ID: ${personId}`;

        if (project && person) {
            await UserEventService.createEventForProjectUsers(
                [id], // Pass as an array
                req.user.user_id,
                'person_removed_from_project',
                `Removed ${personName} from project: ${project.title}`, // Improved message
                personId, // entity_id is the person's ID
                'person' // entity_type is 'person'
            );
        }

        res.json({
            message: 'Person removed from project successfully'
        });
    } catch (error) {
        console.error('Remove person from project error:', error);

        if (error.message.includes('not found') || error.message.includes('not in project')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('access')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({
            message: 'Server error removing person from project',
            error: error.message
        });
    }
};

// Get user events for a specific project
exports.getProjectEvents = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', eventType } = req.query;

        // Check if user has access to this project
        await checkProjectAccess(req, id);

        // Import UserEvent model
        const { UserEvent, User } = require('../models');
        const { Op } = require('sequelize'); // Import Op

        // Build query options
        const queryOptions = {
            where: {
                project_ids: { // Query the new array field
                    [Op.contains]: [id] // Check if the array contains the project ID
                },
                user_id: req.user.user_id
            },
            order: [[sortBy, sortOrder.toUpperCase()]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        };

        // Add event type filter if provided
        if (eventType && eventType !== 'all') {
            queryOptions.where.event_type = eventType;
        }

        // Get events
        const { count, rows: events } = await UserEvent.findAndCountAll(queryOptions);

        // Calculate total pages
        const totalPages = Math.ceil(count / parseInt(limit));

        // Log for debugging
        console.log(`Found ${count} events for project ${id}`);

        res.json({
            events,
            metadata: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Get project events error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('access')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({
            message: 'Server error retrieving project events',
            error: error.message
        });
    }
};

// Helper function to check if user has access to a project
async function checkProjectAccess(req, projectId) {
    // Check if user is a manager
    const isManager = req.user.roles.includes('manager');

    if (isManager) {
        return true;
    }

    // Check if user has access to this project
    const userProject = await Project.findOne({
        where: { id: projectId },
        include: [{
            model: User,
            where: { user_id: req.user.user_id },
            through: { attributes: ['access_level'] }
        }]
    });

    if (!userProject) {
        throw new Error('You do not have access to this project');
    }

    return true;
}

// Get relationships for a specific project
exports.getProjectRelationships = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortBy, sortOrder } = req.query;

        // Check if user has access to this project
        await checkProjectAccess(req, id);

        const relationships = await projectService.getProjectRelationships(id, { sortBy, sortOrder });

        res.json(relationships);
    } catch (error) {
        console.error('Get project relationships error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('access')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({
            message: 'Server error retrieving project relationships',
            error: error.message
        });
    }
};

// Helper function to check if user has edit access to a project
async function checkProjectEditAccess(req, projectId) {
    // Check if user is a manager
    const isManager = req.user.roles.includes('manager');

    // First, check if the project is completed
    const project = await Project.findByPk(projectId);

    if (!project) {
        throw new Error('Project not found');
    }

    // If project is completed AND this is not a status change request, prevent edit operations
    // We'll check req.body to see if this is a status-only change
    if (project.status === 'completed' && req.body &&
        (Object.keys(req.body).length > 1 || (Object.keys(req.body).length === 1 && !req.body.status))) {
        throw new Error('Completed projects cannot be modified. You can only change the status.');
    }

    if (isManager) {
        return true;
    }

    // Check if user has edit access to this project
    const userProject = await Project.findOne({
        where: { id: projectId },
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
        throw new Error('You do not have edit access to this project');
    }

    return true;
}
