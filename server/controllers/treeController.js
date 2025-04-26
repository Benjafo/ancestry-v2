const { User, Tree } = require('../models');

// Get all trees for the current user
exports.getUserTrees = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            include: [{
                model: Tree,
                through: { attributes: ['access_level'] }
            }]
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const trees = user.Trees.map(tree => ({
            tree_id: tree.tree_id,
            name: tree.name,
            description: tree.description,
            access_level: tree.user_trees.access_level,
            created_at: tree.created_at,
            updated_at: tree.updated_at
        }));
        
        res.status(200).json({ trees });
    } catch (error) {
        console.error('Get user trees error:', error);
        res.status(500).json({ message: 'Server error retrieving trees' });
    }
};

// Get a specific tree by ID
exports.getTreeById = async (req, res) => {
    try {
        const { treeId } = req.params;
        
        const tree = await Tree.findByPk(treeId, {
            include: [{
                model: User,
                as: 'creator',
                attributes: ['user_id', 'first_name', 'last_name', 'email']
            }]
        });
        
        if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
        }
        
        res.status(200).json({ tree });
    } catch (error) {
        console.error('Get tree error:', error);
        res.status(500).json({ message: 'Server error retrieving tree' });
    }
};

// Create a new tree
exports.createTree = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const tree = await Tree.create({
            name,
            description,
            created_by: req.user.user_id
        });
        
        // Assign the creator access to the tree
        await tree.addUser(req.user.user_id, { 
            through: { access_level: 'edit' }
        });
        
        res.status(201).json({
            message: 'Tree created successfully',
            tree
        });
    } catch (error) {
        console.error('Create tree error:', error);
        res.status(500).json({ message: 'Server error creating tree' });
    }
};

// Update a tree
exports.updateTree = async (req, res) => {
    try {
        const { treeId } = req.params;
        const { name, description } = req.body;
        
        const tree = await Tree.findByPk(treeId);
        
        if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
        }
        
        // Update tree properties
        tree.name = name || tree.name;
        tree.description = description !== undefined ? description : tree.description;
        
        await tree.save();
        
        res.status(200).json({
            message: 'Tree updated successfully',
            tree
        });
    } catch (error) {
        console.error('Update tree error:', error);
        res.status(500).json({ message: 'Server error updating tree' });
    }
};

// Delete a tree
exports.deleteTree = async (req, res) => {
    try {
        const { treeId } = req.params;
        
        const tree = await Tree.findByPk(treeId);
        
        if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
        }
        
        await tree.destroy();
        
        res.status(200).json({
            message: 'Tree deleted successfully'
        });
    } catch (error) {
        console.error('Delete tree error:', error);
        res.status(500).json({ message: 'Server error deleting tree' });
    }
};

// Assign a user to a tree
exports.assignUserToTree = async (req, res) => {
    try {
        const { treeId } = req.params;
        const { userId, accessLevel } = req.body;
        
        // Validate access level
        if (!['view', 'edit'].includes(accessLevel)) {
            return res.status(400).json({ message: 'Invalid access level. Must be "view" or "edit"' });
        }
        
        // Check if tree exists
        const tree = await Tree.findByPk(treeId);
        if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
        }
        
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Assign user to tree
        await tree.addUser(userId, { 
            through: { access_level: accessLevel }
        });
        
        res.status(200).json({
            message: 'User assigned to tree successfully'
        });
    } catch (error) {
        console.error('Assign user to tree error:', error);
        res.status(500).json({ message: 'Server error assigning user to tree' });
    }
};

// Remove a user from a tree
exports.removeUserFromTree = async (req, res) => {
    try {
        const { treeId, userId } = req.params;
        
        // Check if tree exists
        const tree = await Tree.findByPk(treeId);
        if (!tree) {
            return res.status(404).json({ message: 'Tree not found' });
        }
        
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Remove user from tree
        await tree.removeUser(userId);
        
        res.status(200).json({
            message: 'User removed from tree successfully'
        });
    } catch (error) {
        console.error('Remove user from tree error:', error);
        res.status(500).json({ message: 'Server error removing user from tree' });
    }
};
