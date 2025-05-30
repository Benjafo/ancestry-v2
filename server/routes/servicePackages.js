const express = require('express');
const router = express.Router();
const servicePackageController = require('../controllers/servicePackageController');
const { verifyToken, hasRole } = require('../middleware/auth'); // Corrected import

// Public route to get all active service packages
router.get('/', servicePackageController.getAllActiveServicePackages);

// Admin-only routes for managing service packages
router.post('/', verifyToken, hasRole('manager'), servicePackageController.createServicePackage);
router.get('/:id', verifyToken, hasRole('manager'), servicePackageController.getServicePackageById);
router.put('/:id', verifyToken, hasRole('manager'), servicePackageController.updateServicePackage);
router.put('/:id/deactivate', verifyToken, hasRole('manager'), servicePackageController.deactivateServicePackage);
router.put('/:id/reactivate', verifyToken, hasRole('manager'), servicePackageController.reactivateServicePackage);

module.exports = router;
