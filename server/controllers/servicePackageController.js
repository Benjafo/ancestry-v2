const servicePackageService = require('../services/servicePackageService');

const servicePackageController = {
    /**
     * Get all active service packages (publicly accessible).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getAllActiveServicePackages: async (req, res) => {
        try {
            const packages = await servicePackageService.getActiveServicePackages();
            res.status(200).json({ servicePackages: packages });
        } catch (error) {
            console.error('Error in getAllActiveServicePackages:', error);
            res.status(500).json({ message: error });
        }
    },

    /**
     * Get a service package by ID (admin only).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    getServicePackageById: async (req, res) => {
        try {
            const { id } = req.params;
            const servicePackage = await servicePackageService.getServicePackageById(id);
            res.status(200).json(servicePackage);
        } catch (error) {
            console.error('Error in getServicePackageById:', error);
            res.status(404).json({ message: error });
        }
    },

    /**
     * Create a new service package (admin only).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    createServicePackage: async (req, res) => {
        try {
            const newPackage = await servicePackageService.createServicePackage(req.body);
            res.status(201).json({ message: 'Service package created successfully.', servicePackage: newPackage });
        } catch (error) {
            console.error('Error in createServicePackage:', error);
            res.status(400).json({ message: error });
        }
    },

    /**
     * Update an existing service package (admin only).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    updateServicePackage: async (req, res) => {
        try {
            const { id } = req.params;
            const updatedPackage = await servicePackageService.updateServicePackage(id, req.body);
            res.status(200).json({ message: 'Service package updated successfully.', servicePackage: updatedPackage });
        } catch (error) {
            console.error('Error in updateServicePackage:', error);
            res.status(400).json({ message: error });
        }
    },

    /**
     * Deactivate a service package (admin only).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    deactivateServicePackage: async (req, res) => {
        try {
            const { id } = req.params;
            await servicePackageService.deactivateServicePackage(id);
            res.status(200).json({ message: 'Service package deactivated successfully.' });
        } catch (error) {
            console.error('Error in deactivateServicePackage:', error);
            res.status(400).json({ message: error });
        }
    },

    /**
     * Reactivate a service package (admin only).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    reactivateServicePackage: async (req, res) => {
        try {
            const { id } = req.params;
            await servicePackageService.reactivateServicePackage(id);
            res.status(200).json({ message: 'Service package reactivated successfully.' });
        } catch (error) {
            console.error('Error in reactivateServicePackage:', error);
            res.status(400).json({ message: error });
        }
    },
};

module.exports = servicePackageController;
