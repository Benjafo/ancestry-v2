const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { verifyToken, hasRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
    createUserValidation, 
    updateUserValidation,
    clientIdValidation,
    projectIdValidation,
    userIdValidation
} = require('../validations/managerValidations');

// All routes require authentication and manager role
router.use(verifyToken);
router.use(hasRole('manager'));

// Dashboard routes
router.get('/dashboard', managerController.getDashboardSummary);

// User management routes
router.get('/users', managerController.getUsers);
router.get('/users/:userId', validate(userIdValidation), managerController.getUserById);
router.post('/users', validate(createUserValidation), managerController.createUser);
router.put('/users/:userId', validate(updateUserValidation), managerController.updateUser);
router.put('/users/:userId/deactivate', validate(userIdValidation), managerController.deactivateUser);
router.put('/users/:userId/reactivate', validate(userIdValidation), managerController.reactivateUser);
router.post('/users/:userId/reset-password', validate(userIdValidation), managerController.resetUserPassword);

// Client assignment routes
router.get('/clients/:clientId/assignments', validate(clientIdValidation), managerController.getClientAssignments);
router.post('/clients/:clientId/projects/:projectId', validate([...clientIdValidation, ...projectIdValidation]), managerController.assignClientToProject);
router.delete('/clients/:clientId/projects/:projectId', validate([...clientIdValidation, ...projectIdValidation]), managerController.removeClientFromProject);
router.get('/clients/:clientId/assignment-history', validate(clientIdValidation), managerController.getAssignmentHistory);

module.exports = router;
