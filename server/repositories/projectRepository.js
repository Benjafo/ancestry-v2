const BaseRepository = require('./baseRepository');
const { Project, Person, ProjectPerson, Event, Document } = require('../models');
const { Op } = require('sequelize');
const QueryBuilder = require('../utils/queryBuilder');

/**
 * Project Repository
 * Handles data access operations for Project entities
 */
class ProjectRepository extends BaseRepository {
    /**
     * Constructor
     */
    constructor() {
        super(Project);
    }

    /**
     * Find projects with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @param {Number} params.page - Page number
     * @param {Number} params.pageSize - Page size
     * @param {String} params.sortBy - Sort field
     * @param {String} params.sortOrder - Sort order (asc/desc)
     * @param {String} params.search - Search term for title/description
     * @param {String} params.status - Filter by status
     * @returns {Promise<Object>} Paginated result with projects and metadata
     */
    async findProjects(params = {}) {
        const page = parseInt(params.page, 10) || 1;
        const pageSize = parseInt(params.pageSize, 10) || 10;
        const offset = (page - 1) * pageSize;
        const sortBy = params.sortBy || 'created_at';
        const sortOrder = params.sortOrder || 'desc';

        // Build where clause
        const where = {};

        if (params.search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${params.search}%` } },
                { description: { [Op.iLike]: `%${params.search}%` } }
            ];
        }

        if (params.status) {
            where.status = params.status;
        }

        // Execute query
        const result = await this.findAndCountAll({
            where,
            limit: pageSize,
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: Person,
                    as: 'persons',
                    through: { attributes: [] },
                    required: false
                }
            ]
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(result.count / pageSize);

        return {
            projects: result.rows,
            metadata: {
                totalCount: result.count,
                totalPages,
                currentPage: page,
                pageSize
            }
        };
    }

    /**
     * Find a project by ID with optional related data
     * 
     * @param {String} id - Project ID
     * @param {Object} options - Query options
     * @param {Boolean} options.includePersons - Include persons
     * @param {Boolean} options.includeEvents - Include events
     * @param {Boolean} options.includeDocuments - Include documents
     * @returns {Promise<Object>} Project with related data
     */
    async findProjectById(id, options = {}) {
        const include = [];

        // Include documents directly associated with the project
        if (options.includeDocuments) {
            include.push({
                model: Document,
                as: 'documents',
                required: false
            });
        }

        // Always include persons if requested, and nest includes for person-related data
        if (options.includePersons) {
            const personInclude = {
                model: Person,
                as: 'persons',
                through: { attributes: ['notes'] },
                required: false,
                include: [] // Nested includes for person-related data
            };

            if (options.includeEvents) {
                personInclude.include.push({
                    model: Event,
                    as: 'events', // Use the alias defined in models/index.js
                    through: { attributes: [] }, // Exclude join table attributes
                    required: false
                });
            }

            // Add person-related documents if requested
            if (options.includeDocuments) {
                personInclude.include.push({
                    model: Document,
                    as: 'documents', // Use the alias defined in models/index.js
                    through: { attributes: [] }, // Exclude join table attributes
                    required: false
                });
            }

            if (options.includeRelationships) {
                personInclude.include.push({
                    model: Relationship,
                    as: 'relationshipsAsSubject', // Use the alias defined in models/index.js
                    required: false,
                    include: [{
                        model: Person,
                        as: 'person2',
                        attributes: ['person_id', 'first_name', 'last_name', 'middle_name', 'gender', 'birth_date', 'death_date']
                    }]
                });
                personInclude.include.push({
                    model: Relationship,
                    as: 'relationshipsAsObject', // Use the alias defined in models/index.js
                    required: false,
                    include: [{
                        model: Person,
                        as: 'person1',
                        attributes: ['person_id', 'first_name', 'last_name', 'middle_name', 'gender', 'birth_date', 'death_date']
                    }]
                });
            }


            include.push(personInclude);
        }

        // Include project-level events if needed (currently not used in frontend ProjectDetail)
        // if (options.includeEvents) {
        //     include.push({
        //         model: Event,
        //         as: 'events', // Use the alias defined in models/index.js
        //         through: { attributes: [] },
        //         required: false
        //     });
        // }


        return await this.findById(id, { include });
    }

    /**
     * Get all persons associated with a project
     * @param {String} projectId - Project ID
     * @param {Object} options - Query options including sortBy and sortOrder
     * @returns {Promise<Array>} Array of persons
     */
    async getProjectPersons(projectId, options = {}) {
        const allowedSortFields = [
            'created_at', 'updated_at', 'first_name', 'last_name', 'birth_date'
        ];

        const queryOptions = QueryBuilder.buildQueryOptions(
            {
                sortBy: options.sortBy,
                sortOrder: options.sortOrder
            },
            {
                allowedSortFields,
                defaultSortField: 'created_at',
                defaultSortOrder: 'desc'
            }
        );

        // Extract the order from queryOptions to apply it at the main query level
        const sortField = queryOptions.order ? queryOptions.order[0][0] : 'created_at';
        const sortDirection = queryOptions.order ? queryOptions.order[0][1] : 'DESC';

        const project = await this.findById(projectId, {
            include: [{
                model: Person,
                as: 'persons',
                through: { attributes: ['notes'] } // Include notes from junction table
            }],
            order: [
                [{ model: Person, as: 'persons' }, sortField, sortDirection]
            ]
        });

        return project ? project.persons : [];
    }

    /**
     * Add a person to a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @param {Object} data - Additional data (notes)
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Created association
     */
    async addPersonToProject(projectId, personId, data = {}, options = {}) {
        return await ProjectPerson.create({
            project_id: projectId,
            person_id: personId,
            notes: data.notes
        }, options);
    }

    /**
     * Update a person's association with a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @param {Object} data - Data to update (notes)
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Updated association
     */
    async updateProjectPerson(projectId, personId, data, options = {}) {
        const [rowsUpdated, [updated]] = await ProjectPerson.update(
            { notes: data.notes },
            {
                where: { project_id: projectId, person_id: personId },
                returning: true,
                ...options
            }
        );

        return updated;
    }

    /**
     * Remove a person from a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Boolean>} True if successful
     */
    async removePersonFromProject(projectId, personId, options = {}) {
        const deleted = await ProjectPerson.destroy({
            where: { project_id: projectId, person_id: personId },
            ...options
        });

        return deleted > 0;
    }

    /**
     * Check if a person is in a project
     * @param {String} projectId - Project ID
     * @param {String} personId - Person ID
     * @returns {Promise<Boolean>} True if person is in project
     */
    async isPersonInProject(projectId, personId) {
        const count = await ProjectPerson.count({
            where: { project_id: projectId, person_id: personId }
        });

        return count > 0;
    }

    /**
     * Check if a project exists
     * @param {String} projectId - Project ID
     * @param {Object} options - Query options
     * @returns {Promise<Boolean>} True if project exists
     */
    async exists(projectId, options = {}) {
        const count = await this.count({
            where: { id: projectId },
            ...options
        });

        return count > 0;
    }
}

module.exports = new ProjectRepository();
