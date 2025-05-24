const projectRepository = require('../repositories/projectRepository');
const personRepository = require('../repositories/personRepository');
const TransactionManager = require('../utils/transactionManager');

/**
 * Project Service
 * Handles business logic for Project entities
 */
class ProjectService {
    /**
     * Get projects with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated result with projects and metadata
     */
    async getProjects(params = {}) {
        return await projectRepository.findProjects(params);
    }

    /**
     * Get a project by ID with optional related data
     * 
     * @param {String} id - Project ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Project with related data
     */
    async getProjectById(id, options = {}) {
        return await projectRepository.findProjectById(id, options);
    }

    /**
     * Create a new project
     * 
     * @param {Object} projectData - Project data
     * @returns {Promise<Object>} Created project
     */
    async createProject(projectData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            const project = await projectRepository.create(projectData, { transaction });
            return project;
        });
    }

    /**
     * Update a project
     * 
     * @param {String} id - Project ID
     * @param {Object} projectData - Project data to update
     * @returns {Promise<Object>} Updated project
     */
    async updateProject(id, projectData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if project exists
            const projectExists = await projectRepository.exists(id, { transaction });
            if (!projectExists) {
                throw new Error(`Project with id ${id} not found`);
            }

            // Update the project
            const project = await projectRepository.update(id, projectData, { transaction });
            return project;
        });
    }

    /**
     * Delete a project
     * 
     * @param {String} id - Project ID
     * @returns {Promise<Boolean>} True if successful
     */
    async deleteProject(id) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if project exists
            const projectExists = await projectRepository.exists(id, { transaction });
            if (!projectExists) {
                throw new Error(`Project with id ${id} not found`);
            }

            // Delete the project
            return await projectRepository.delete(id, { transaction });
        });
    }

    /**
     * Get all persons in a project
     * @param {String} projectId - Project ID
     * @returns {Promise<Array>} Array of persons
     */
    async getProjectPersons(projectId) {
        // Check if project exists
        const projectExists = await projectRepository.exists(projectId);
        if (!projectExists) {
            throw new Error(`Project with id ${projectId} not found`);
        }

        return await projectRepository.getProjectPersons(projectId);
    }

    /**
     * Add a person to a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @param {Object} data - Additional data (notes)
     * @returns {Promise<Object>} Created association
     */
    async addPersonToProject(projectId, personId, data = {}) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if project exists
            const projectExists = await projectRepository.exists(projectId, { transaction });
            if (!projectExists) {
                throw new Error(`Project with id ${projectId} not found`);
            }

            // Check if person exists
            const person = await personRepository.findById(personId, { transaction });
            if (!person) {
                throw new Error(`Person with id ${personId} not found`);
            }

            // Check if person is already in project
            const isInProject = await projectRepository.isPersonInProject(projectId, personId);
            if (isInProject) {
                throw new Error(`Person with id ${personId} is already in project ${projectId}`);
            }

            // Add person to project
            return await projectRepository.addPersonToProject(projectId, personId, data, { transaction });
        });
    }

    /**
     * Update a person's association with a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @param {Object} data - Data to update (notes)
     * @returns {Promise<Object>} Updated association
     */
    async updateProjectPerson(projectId, personId, data) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if project exists
            const projectExists = await projectRepository.exists(projectId, { transaction });
            if (!projectExists) {
                throw new Error(`Project with id ${projectId} not found`);
            }

            // Check if person exists
            const person = await personRepository.findById(personId, { transaction });
            if (!person) {
                throw new Error(`Person with id ${personId} not found`);
            }

            // Check if person is in project
            const isInProject = await projectRepository.isPersonInProject(projectId, personId);
            if (!isInProject) {
                throw new Error(`Person with id ${personId} is not in project ${projectId}`);
            }

            // Update association
            return await projectRepository.updateProjectPerson(projectId, personId, data, { transaction });
        });
    }

    /**
     * Remove a person from a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @returns {Promise<Boolean>} True if successful
     */
    async removePersonFromProject(projectId, personId) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if project exists
            const projectExists = await projectRepository.exists(projectId, { transaction });
            if (!projectExists) {
                throw new Error(`Project with id ${projectId} not found`);
            }

            // Check if person is in project
            const isInProject = await projectRepository.isPersonInProject(projectId, personId);
            if (!isInProject) {
                throw new Error(`Person with id ${personId} is not in project ${projectId}`);
            }

            // Remove person from project
            return await projectRepository.removePersonFromProject(projectId, personId, { transaction });
        });
    }
}

module.exports = new ProjectService();
