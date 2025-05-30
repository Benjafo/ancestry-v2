const projectRepository = require('../repositories/projectRepository');
const personRepository = require('../repositories/personRepository');
const relationshipRepository = require('../repositories/relationshipRepository');
const TransactionManager = require('../utils/transactionManager');
const { User, ProjectUser, Role } = require('../models'); // Import User, ProjectUser, and Role models

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
    async createProject(projectData, transaction) {
        return await TransactionManager.executeTransaction(async (t) => {
            const currentTransaction = transaction || t;

            // Extract client_user_id and service_package_id if provided
            const { client_user_id, service_package_id, ...restOfProjectData } = projectData;

            // Find a default researcher (e.g., the first user with 'manager' role)
            // In a real application, this might be configurable or more complex
            const defaultResearcherRole = await Role.findOne({ where: { name: 'manager' }, transaction: currentTransaction });
            let defaultResearcher = null;
            if (defaultResearcherRole) {
                defaultResearcher = await User.findOne({
                    include: [{
                        model: Role,
                        where: { role_id: defaultResearcherRole.role_id },
                        through: { attributes: [] } // Don't fetch through table attributes
                    }],
                    transaction: currentTransaction
                });
            }

            const projectToCreate = {
                ...restOfProjectData,
                researcher_id: defaultResearcher ? defaultResearcher.user_id : null, // Assign default researcher
                service_package_id: service_package_id || null, // Link to service package if provided
            };

            const project = await projectRepository.create(projectToCreate, { transaction: currentTransaction });

            // If a client_user_id is provided, associate the client with the project
            if (client_user_id) {
                await ProjectUser.create({
                    project_id: project.id,
                    user_id: client_user_id,
                    access_level: 'view', // Clients typically have 'view' access
                }, { transaction: currentTransaction });

                // Log project assignment to client
                await createEvent(
                    client_user_id,
                    defaultResearcher ? defaultResearcher.user_id : null, // Actor is researcher if assigned, else null
                    'project_assigned',
                    `Project "${project.title}" assigned to client.`,
                    project.id,
                    'project',
                    currentTransaction
                );
            }

            // Log project creation event
            await createEvent(
                defaultResearcher ? defaultResearcher.user_id : null, // Actor is researcher if assigned, else null
                defaultResearcher ? defaultResearcher.user_id : null,
                'project_created',
                `New project "${project.title}" created.`,
                project.id,
                'project',
                currentTransaction
            );

            return project;
        }, transaction); // Pass the transaction if it exists, otherwise a new one will be created
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
     * @param {Object} options - Query options including sortBy and sortOrder
     * @returns {Promise<Array>} Array of persons
     */
    async getProjectPersons(projectId, options = {}) {
        // Check if project exists
        const projectExists = await projectRepository.exists(projectId);
        if (!projectExists) {
            throw new Error(`Project with id ${projectId} not found`);
        }

        return await projectRepository.getProjectPersons(projectId, options);
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
    /**
     * Get relationships for a specific project
     * 
     * @param {String} projectId - Project ID
     * @param {Object} options - Query options including sortBy and sortOrder
     * @returns {Promise<Array>} Array of relationships
     */
    async getProjectRelationships(projectId, options = {}) {
        // Check if project exists
        const projectExists = await projectRepository.exists(projectId);
        if (!projectExists) {
            throw new Error(`Project with id ${projectId} not found`);
        }

        // Get all persons in the project
        const persons = await projectRepository.getProjectPersons(projectId);

        if (!persons || persons.length === 0) {
            return [];
        }

        // Extract person IDs
        const personIds = persons.map(person => person.person_id);

        // Find all relationships where either person1 or person2 is in the project
        const relationships = await relationshipRepository.findRelationshipsInvolvingPersons(personIds, options);

        return relationships;
    }
}

module.exports = new ProjectService();
