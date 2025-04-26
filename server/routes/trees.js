const express = require('express');
const router = express.Router();
const treeController = require('../controllers/treeController');
const { verifyToken, hasRole, hasTreeAccess } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get all trees for the current user
router.get('/', treeController.getUserTrees);

// Create a new tree
router.post('/', treeController.createTree);

// Get a specific tree by ID
router.get('/:treeId', hasTreeAccess('view'), treeController.getTreeById);

// Update a tree
router.put('/:treeId', hasTreeAccess('edit'), treeController.updateTree);

// Delete a tree
router.delete('/:treeId', hasTreeAccess('edit'), treeController.deleteTree);

// Manager-only routes for assigning users to trees
router.post('/:treeId/users', hasRole('manager'), treeController.assignUserToTree);
router.delete('/:treeId/users/:userId', hasRole('manager'), treeController.removeUserFromTree);

module.exports = router;
