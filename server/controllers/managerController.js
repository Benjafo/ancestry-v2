const { User, Role, Project, UserEvent, ProjectUser } = require('../models'); // Added ProjectUser
const UserEventService = require('../services/userEventService');
const { Op, Sequelize } = require('sequelize');

// Get dashboard summary for managers
exports.getDashboardSummary = async (req, res) => {
    try {
        // Fetch active clients count
        const activeClients = await User.count({
            include: [{
                model: Role,
                where: { name: 'client' }
            }],
            where: { is_active: true }
        });

        // Fetch unassigned clients count using subquery approach
        // First get all active client user IDs
        const activeClientIds = await User.findAll({
            include: [{
                model: Role,
                where: { name: 'client' }
            }],
            where: { is_active: true },
            attributes: ['user_id'],
            raw: true
        });

        const clientUserIds = activeClientIds.map(client => client.user_id);

        // Then count how many of those IDs don't have project associations
        let unassignedClientsCount = 0;
        if (clientUserIds.length > 0) {
            const assignedClientIds = await ProjectUser.findAll({
                where: {
                    user_id: { [Op.in]: clientUserIds }
                },
                attributes: ['user_id'],
                group: ['user_id'],
                raw: true
            });

            const assignedUserIds = new Set(assignedClientIds.map(item => item.user_id));
            unassignedClientsCount = clientUserIds.filter(id => !assignedUserIds.has(id)).length;
        }

        // Fetch total clients count
        const totalClients = await User.count({
            include: [{
                model: Role,
                where: { name: 'client' }
            }]
        });

        // Fetch active projects count
        const activeProjects = await Project.count({
            where: { status: 'active' }
        });

        // Fetch total projects count
        const totalProjects = await Project.count();

        // Fetch projects by status
        const projectsByStatus = {
            active: await Project.count({ where: { status: 'active' } }),
            completed: await Project.count({ where: { status: 'completed' } }),
            on_hold: await Project.count({ where: { status: 'on_hold' } })
        };

        // Fetch real user events for recent activity
        const userEvents = await UserEvent.findAll({
            // limit: 10,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'event_type', 'message', 'entity_type', 'entity_id', 'created_at', 'updated_at'],
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        });

        // Transform user events into the expected format for the dashboard
        const formattedActivity = userEvents.map(event => ({
            id: event.id,
            type: event.event_type,
            description: event.message,
            projectId: event.entity_type === 'project' ? event.entity_id : null,
            date: event.get('created_at'),
            actor: event.actor ? `${event.actor.first_name} ${event.actor.last_name}` : 'System'
        }));

        // For now, return empty pending tasks (to be implemented later)
        const pendingTasks = [];

        res.status(200).json({
            activeClients,
            totalClients,
            unassignedClientsCount,
            activeProjects,
            totalProjects,
            recentActivity: formattedActivity,
            pendingTasks,
            projectsByStatus
        });
    } catch (error) {
        console.error('Manager dashboard error:', error);
        res.status(500).json({ message: 'Server error retrieving manager dashboard' });
    }
};

// Get all users with optional filtering, pagination, and sorting
exports.getUsers = async (req, res) => {
    try {
        const {
            filter = 'all',
            page = 1,
            limit = 10,
            sortField = 'created_at',
            sortDirection = 'desc',
            status
        } = req.query;

        let effectiveLimit = parseInt(limit);
        let effectiveOffset = (parseInt(page) - 1) * effectiveLimit;

        // If limit is 0, fetch all records for the given filter
        if (effectiveLimit === 0) {
            effectiveLimit = null; // Sequelize interprets null as no limit
            effectiveOffset = 0;
        }

        const direction = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let whereCondition = {};
        let includeCondition = [{ model: Role }];

        // Apply status filter if provided
        if (status === 'active') {
            whereCondition.is_active = true;
        } else if (status === 'inactive') {
            whereCondition.is_active = false;
        }

        // Apply role filter
        if (filter === 'clients') {
            includeCondition = [{
                model: Role,
                where: { name: 'client' }
            }];
            whereCondition.is_active = true;
        } else if (filter === 'managers') {
            includeCondition = [{
                model: Role,
                where: { name: 'manager' }
            }];
        }

        // Get total count for pagination
        const count = await User.count({
            where: whereCondition,
            include: includeCondition
        });

        // Define order based on sortField
        let order = [];

        // Handle special case for name sorting (which combines first_name and last_name)
        if (sortField === 'name') {
            order = [
                [Sequelize.fn('LOWER', Sequelize.col('first_name')), direction],
                [Sequelize.fn('LOWER', Sequelize.col('last_name')), direction]
            ];
        }
        // Handle special case for role sorting (which is in a related model)
        else if (sortField === 'role') {
            order = [
                [{ model: Role }, 'name', direction]
            ];
        }
        // Handle special case for status sorting (which is based on is_active)
        else if (sortField === 'status') {
            order = [
                ['is_active', direction]
            ];
        }
        // Default case for other fields
        else {
            // Map frontend field names to database column names if needed
            const fieldMap = {
                'last_login': 'last_login',
                'email': 'email',
                // Add other mappings as needed
            };

            const dbField = fieldMap[sortField] || 'created_at';

            // Use case-insensitive sorting for string fields
            if (['email'].includes(sortField)) {
                order = [[Sequelize.fn('LOWER', Sequelize.col(dbField)), direction]];
            } else {
                order = [[dbField, direction]];
            }
        }

        // Get paginated and sorted users
        const users = await User.findAll({
            where: whereCondition,
            include: includeCondition,
            attributes: { exclude: ['password'] },
            limit: effectiveLimit,
            offset: effectiveOffset,
            order: order
        });

        // Format users to include roles
        const formattedUsers = users.map(user => {
            const userData = user.toJSON();
            return {
                ...userData,
                roles: userData.Roles ? userData.Roles.map(role => role.name) : []
            };
        });

        res.status(200).json({
            users: formattedUsers,
            metadata: {
                total: count,
                page: effectiveLimit === null ? 1 : parseInt(page), // If all are fetched, it's effectively page 1
                limit: effectiveLimit === null ? count : effectiveLimit, // If all, limit is total count
                totalPages: effectiveLimit === null ? 1 : Math.ceil(count / effectiveLimit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error retrieving users' });
    }
};

// Get a specific user by ID
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format user to include roles
        const userData = user.toJSON();
        const formattedUser = {
            ...userData,
            roles: userData.Roles ? userData.Roles.map(role => role.name) : []
        };

        res.status(200).json({ user: formattedUser });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error retrieving user' });
    }
};

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { email, password, first_name, last_name, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            email,
            password, // Will be hashed by the model hook
            first_name,
            last_name,
            is_active: true
        });

        // Find the requested role
        const userRole = await Role.findOne({ where: { name: role } });
        if (!userRole) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Assign role to user
        await user.addRole(userRole);

        // Get user with roles
        const createdUser = await User.findByPk(user.user_id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        // Format user to include roles
        const userData = createdUser.toJSON();
        const formattedUser = {
            ...userData,
            roles: userData.Roles ? userData.Roles.map(role => role.name) : []
        };

        // Create user event for the manager who created the user
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'user_created',
            `Created new ${role} user: ${first_name} ${last_name}`,
            user.user_id,
            'user'
        );

        res.status(201).json({
            message: 'User created successfully',
            user: formattedUser
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error creating user' });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { first_name, last_name, role } = req.body;

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user properties
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;

        await user.save();

        // Update role if provided
        if (role) {
            // Find the requested role
            const userRole = await Role.findOne({ where: { name: role } });
            if (!userRole) {
                return res.status(400).json({ message: 'Invalid role' });
            }

            // Remove existing roles
            const currentRoles = await user.getRoles();
            await user.removeRoles(currentRoles);

            // Assign new role
            await user.addRole(userRole);
        }

        // Get updated user with roles
        const updatedUser = await User.findByPk(userId, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        // Create user event for the updated user
        const manager = req.user; // The manager performing the update
        const message = `Your profile was updated`;
        await UserEventService.createEvent(
            updatedUser.user_id, // User receiving the event (the updated user)
            manager.user_id, // Actor (the manager)
            'user_updated',
            message,
            updatedUser.user_id,
            'user'
        );

        // Create user event for the manager (actor)
        const managerMessage = `Updated user: ${updatedUser.first_name} ${updatedUser.last_name}.`;
        await UserEventService.createEvent(
            manager.user_id, // User receiving the event (the manager)
            manager.user_id, // Actor (the manager)
            'user_updated',
            managerMessage,
            updatedUser.user_id,
            'user'
        );

        // Format user to include roles
        const userData = updatedUser.toJSON();
        const formattedUser = {
            ...userData,
            roles: userData.Roles ? userData.Roles.map(role => role.name) : []
        };

        res.status(200).json({
            message: 'User updated successfully',
            user: formattedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error updating user' });
    }
};

// Deactivate a user
exports.deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Deactivate user
        user.is_active = false;
        await user.save();

        // Create user event for the manager who deactivated the user
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'user_deactivated',
            `Deactivated user: ${user.first_name} ${user.last_name}`,
            userId,
            'user'
        );

        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ message: 'Server error deactivating user' });
    }
};

// Reactivate a user
exports.reactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Reactivate user
        user.is_active = true;
        await user.save();

        // Create user event for the manager who reactivated the user
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'user_reactivated',
            `Reactivated user: ${user.first_name} ${user.last_name}`,
            userId,
            'user'
        );

        res.status(200).json({ message: 'User reactivated successfully' });
    } catch (error) {
        console.error('Reactivate user error:', error);
        res.status(500).json({ message: 'Server error reactivating user' });
    }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate temporary password
        const temporaryPassword = Math.random().toString(36).slice(-8);

        // Update user password
        user.password = temporaryPassword; // Will be hashed by the model hook
        await user.save();

        // Create user event for the manager who reset the password
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'password_reset',
            `Reset password for user: ${user.first_name} ${user.last_name}`,
            userId,
            'user'
        );

        res.status(200).json({
            message: 'Password reset successfully',
            temporaryPassword
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error resetting password' });
    }
};

// Get client assignments
exports.getClientAssignments = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Verify client exists
        const client = await User.findByPk(clientId, {
            include: [{
                model: Role,
                where: { name: 'client' }
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Get client's projects
        const projects = await Project.findAll({
            include: [{
                model: User,
                where: { user_id: clientId },
                through: { attributes: ['access_level'] }
            }]
        });

        // Format projects to include access level
        const formattedProjects = projects.map(project => {
            const projectData = project.toJSON();
            return {
                ...projectData,
                access_level: projectData.Users[0]?.project_users?.access_level || 'view'
            };
        });

        res.status(200).json({
            projects: formattedProjects
        });
    } catch (error) {
        console.error('Get client assignments error:', error);
        res.status(500).json({ message: 'Server error retrieving client assignments' });
    }
};

// Assign client to project
exports.assignClientToProject = async (req, res) => {
    try {
        const { clientId, projectId } = req.params;
        const { accessLevel = 'view' } = req.body;

        // Verify client exists
        const client = await User.findByPk(clientId, {
            include: [{
                model: Role,
                where: { name: 'client' }
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Verify project exists
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Validate access level
        if (!['view', 'edit'].includes(accessLevel)) {
            return res.status(400).json({ message: 'Invalid access level. Must be "view" or "edit"' });
        }

        // Assign client to project with specified access level
        await project.addUser(clientId, {
            through: { access_level: accessLevel }
        });

        // Create user event for the client
        await UserEventService.createEvent(
            clientId,
            req.user.user_id, // The manager doing the assignment
            'project_assigned',
            `You've been assigned to a new project: ${project.title}`,
            projectId,
            'project'
        );

        // Create user event for the manager
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'project_assigned',
            `Assigned client to project: ${project.title}`,
            projectId,
            'project'
        );

        res.status(200).json({ message: 'Client assigned to project successfully' });
    } catch (error) {
        console.error('Assign client to project error:', error);
        res.status(500).json({ message: 'Server error assigning client to project' });
    }
};

// Remove client from project
exports.removeClientFromProject = async (req, res) => {
    try {
        const { clientId, projectId } = req.params;

        // Verify client exists
        const client = await User.findByPk(clientId, {
            include: [{
                model: Role,
                where: { name: 'client' }
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Verify project exists
        const project = await Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Remove client from project
        await project.removeUser(clientId);

        // Create user event for the client
        await UserEventService.createEvent(
            clientId,
            req.user.user_id, // The manager doing the removal
            'project_removed',
            `You've been removed from project: ${project.title}`,
            projectId,
            'project'
        );

        // Create user event for the manager
        await UserEventService.createEvent(
            req.user.user_id,
            req.user.user_id,
            'project_removed',
            `Removed client from project: ${project.title}`,
            projectId,
            'project'
        );

        res.status(200).json({ message: 'Client removed from project successfully' });
    } catch (error) {
        console.error('Remove client from project error:', error);
        res.status(500).json({ message: 'Server error removing client from project' });
    }
};


// Get assignment history
exports.getAssignmentHistory = async (req, res) => {
    try {
        const { clientId } = req.params;

        // Verify client exists
        const client = await User.findByPk(clientId, {
            include: [{
                model: Role,
                where: { name: 'client' }
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Get assignment-related events for this client
        const assignmentEvents = await UserEvent.findAll({
            where: {
                user_id: clientId,
                event_type: {
                    [Op.or]: ['project_assigned', 'project_removed']
                }
            },
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'actor',
                attributes: ['first_name', 'last_name']
            }]
        });

        res.status(200).json({
            history: assignmentEvents
        });
    } catch (error) {
        console.error('Get assignment history error:', error);
        res.status(500).json({ message: 'Server error retrieving assignment history' });
    }
};
