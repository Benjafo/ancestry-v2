const express = require('express');
const router = express.Router();
const treeController = require('../controllers/treeController');
const { verifyToken, hasRole, hasTreeAccess } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
    createTreeValidation,
    updateTreeValidation,
    treeIdValidation,
    assignUserToTreeValidation,
    removeUserFromTreeValidation
} = require('../validations/treeValidations');

// All routes require authentication
router.use(verifyToken);

// Get all trees for the current user
router.get('/', treeController.getUserTrees);

// Create a new tree
router.post('/', validate(createTreeValidation), treeController.createTree);

// Get a specific tree by ID
router.get('/:treeId', validate(treeIdValidation), hasTreeAccess('view'), treeController.getTreeById);

// Update a tree
router.put('/:treeId', validate(updateTreeValidation), hasTreeAccess('edit'), treeController.updateTree);

// Delete a tree
router.delete('/:treeId', validate(treeIdValidation), hasTreeAccess('edit'), treeController.deleteTree);

// Manager-only routes for assigning users to trees
router.post('/:treeId/users', validate(assignUserToTreeValidation), hasRole('manager'), treeController.assignUserToTree);
router.delete('/:treeId/users/:userId', validate(removeUserFromTreeValidation), hasRole('manager'), treeController.removeUserFromTree);

module.exports = router;
