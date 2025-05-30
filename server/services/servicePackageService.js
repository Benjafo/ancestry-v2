const { ServicePackage } = require('../models');

const servicePackageService = {
    /**
     * Gets a list of active service packages, ordered by sort_order.
     * @returns {Promise<Array<ServicePackage>>} - An array of active service packages.
     */
    getActiveServicePackages: async () => {
        try {
            const packages = await ServicePackage.scope('active').findAll();
            return packages;
        } catch (error) {
            console.error('Error fetching active service packages:', error);
            throw error;
        }
    },

    /**
     * Gets a service package by its ID.
     * @param {string} id - The ID of the service package.
     * @returns {Promise<ServicePackage>} - The service package object.
     */
    getServicePackageById: async (id) => {
        try {
            const servicePackage = await ServicePackage.findByPk(id);
            if (!servicePackage) {
                throw new Error('Service package not found.');
            }
            return servicePackage;
        } catch (error) {
            console.error(`Error fetching service package with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Creates a new service package (admin only).
     * @param {object} packageData - The data for the new service package.
     * @returns {Promise<ServicePackage>} - The created service package.
     */
    createServicePackage: async (packageData) => {
        try {
            const newPackage = await ServicePackage.create(packageData);
            return newPackage;
        } catch (error) {
            console.error('Error creating service package:', error);
            throw error;
        }
    },

    /**
     * Updates an existing service package (admin only).
     * @param {string} id - The ID of the service package to update.
     * @param {object} updateData - The data to update.
     * @returns {Promise<ServicePackage>} - The updated service package.
     */
    updateServicePackage: async (id, updateData) => {
        try {
            const servicePackage = await ServicePackage.findByPk(id);
            if (!servicePackage) {
                throw new Error('Service package not found.');
            }
            await servicePackage.update(updateData);
            return servicePackage;
        } catch (error) {
            console.error(`Error updating service package with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Deactivates a service package (admin only).
     * @param {string} id - The ID of the service package to deactivate.
     * @returns {Promise<void>}
     */
    deactivateServicePackage: async (id) => {
        try {
            const servicePackage = await ServicePackage.findByPk(id);
            if (!servicePackage) {
                throw new Error('Service package not found.');
            }
            servicePackage.is_active = false;
            await servicePackage.save();
        } catch (error) {
            console.error(`Error deactivating service package with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Reactivates a service package (admin only).
     * @param {string} id - The ID of the service package to reactivate.
     * @returns {Promise<void>}
     */
    reactivateServicePackage: async (id) => {
        try {
            const servicePackage = await ServicePackage.findByPk(id);
            if (!servicePackage) {
                throw new Error('Service package not found.');
            }
            servicePackage.is_active = true;
            await servicePackage.save();
        } catch (error) {
            console.error(`Error reactivating service package with ID ${id}:`, error);
            throw error;
        }
    },
};

module.exports = servicePackageService;
