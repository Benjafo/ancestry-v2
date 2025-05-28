const BaseRepository = require('./baseRepository');
const { Relationship, Person } = require('../models');
const { Op } = require('sequelize');
const QueryBuilder = require('../utils/queryBuilder');

/**
 * Relationship Repository
 * Handles data access operations for Relationship entities
 */
class RelationshipRepository extends BaseRepository {
    /**
     * Constructor
     */
    constructor() {
        super(Relationship);
    }

    /**
     * Find relationships with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @param {Number} params.page - Page number
     * @param {Number} params.pageSize - Page size
     * @param {String} params.sortBy - Sort field
     * @param {String} params.sortOrder - Sort order (asc/desc)
     * @param {String} params.relationshipType - Filter by relationship type
     * @param {String} params.relationshipQualifier - Filter by relationship qualifier
     * @param {String} params.startDateStart - Filter by start date (start)
     * @param {String} params.startDateEnd - Filter by start date (end)
     * @param {String} params.endDateStart - Filter by end date (start)
     * @param {String} params.endDateEnd - Filter by end date (end)
     * @returns {Promise<Object>} Paginated result with relationships and metadata
     */
    async findRelationships(params = {}) {
        // Define field mappings for query params to database fields
        const fieldMappings = {
            relationshipType: 'relationship_type',
            relationshipQualifier: 'relationship_qualifier',
            startDateStart: 'start_date',
            startDateEnd: 'start_date',
            endDateStart: 'end_date',
            endDateEnd: 'end_date'
        };

        // Define allowed sort fields
        const allowedSortFields = [
            'relationship_type', 'relationship_qualifier', 'start_date', 'end_date', 'created_at', 'updated_at'
        ];

        // Build date range filters
        const dateFilters = {};

        if (params.startDateStart || params.startDateEnd) {
            dateFilters.start_date = {};

            if (params.startDateStart) {
                dateFilters.start_date[Op.gte] = new Date(params.startDateStart);
            }

            if (params.startDateEnd) {
                dateFilters.start_date[Op.lte] = new Date(params.startDateEnd);
            }
        }

        if (params.endDateStart || params.endDateEnd) {
            dateFilters.end_date = {};

            if (params.endDateStart) {
                dateFilters.end_date[Op.gte] = new Date(params.endDateStart);
            }

            if (params.endDateEnd) {
                dateFilters.end_date[Op.lte] = new Date(params.endDateEnd);
            }
        }

        // Build query options
        const queryOptions = QueryBuilder.buildQueryOptions(
            {
                page: params.page,
                pageSize: params.pageSize,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
                relationshipType: params.relationshipType,
                relationshipQualifier: params.relationshipQualifier
            },
            {
                allowedSortFields,
                defaultSortField: 'created_at',
                defaultSortOrder: 'desc',
                fieldMappings
            }
        );

        // Add date filters
        if (Object.keys(dateFilters).length > 0) {
            queryOptions.where = {
                ...queryOptions.where,
                ...dateFilters
            };
        }

        // Add include for person data
        queryOptions.include = [
            {
                model: Person,
                as: 'person1',
                attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
            },
            {
                model: Person,
                as: 'person2',
                attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
            }
        ];

        // Execute query
        const result = await this.findAndCountAll(queryOptions);

        // Calculate pagination metadata
        const page = parseInt(params.page, 10) || 1;
        const pageSize = parseInt(params.pageSize, 10) || 10;
        const totalPages = Math.ceil(result.count / pageSize);

        return {
            relationships: result.rows,
            metadata: {
                totalCount: result.count,
                totalPages,
                currentPage: page,
                pageSize
            }
        };
    }

    /**
     * Find a relationship by ID with person data
     * 
     * @param {String} id - Relationship ID
     * @returns {Promise<Object>} Relationship with person data
     */
    async findRelationshipById(id) {
        return await this.findById(id, {
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
    }

    /**
     * Find relationships by person ID
     * 
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async findByPersonId(personId, options = {}) {
        const queryOptions = {
            where: {
                [Op.or]: [
                    { person1_id: personId },
                    { person2_id: personId }
                ]
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find relationships by type
     * 
     * @param {String} type - Relationship type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async findByType(type, options = {}) {
        const queryOptions = {
            where: {
                relationship_type: type
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find relationships by qualifier
     * 
     * @param {String} qualifier - Relationship qualifier
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async findByQualifier(qualifier, options = {}) {
        const queryOptions = {
            where: {
                relationship_qualifier: qualifier
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find relationships between two persons
     * 
     * @param {String} person1Id - First person ID
     * @param {String} person2Id - Second person ID
     * @returns {Promise<Array>} Array of relationships
     */
    async findBetweenPersons(person1Id, person2Id) {
        return await this.findAll({
            where: {
                [Op.or]: [
                    {
                        person1_id: person1Id,
                        person2_id: person2Id
                    },
                    {
                        person1_id: person2Id,
                        person2_id: person1Id
                    }
                ]
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
    }

    /**
     * Find parent-child relationships
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of parent-child relationships
     */
    async findParentChildRelationships(options = {}) {
        const queryOptions = {
            where: {
                relationship_type: 'parent'
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find spouse relationships
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of spouse relationships
     */
    async findSpouseRelationships(options = {}) {
        const queryOptions = {
            where: {
                relationship_type: 'spouse'
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find relationships by date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {String} dateField - Date field to filter on (start_date or end_date)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async findByDateRange(startDate, endDate, dateField = 'start_date', options = {}) {
        const queryOptions = {
            where: {
                [dateField]: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find active relationships (no end date or end date in the future)
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of active relationships
     */
    async findActiveRelationships(options = {}) {
        const queryOptions = {
            where: {
                [Op.or]: [
                    { end_date: null },
                    { end_date: { [Op.gt]: new Date() } }
                ]
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find ended relationships (has end date in the past)
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of ended relationships
     */
    async findEndedRelationships(options = {}) {
        const queryOptions = {
            where: {
                end_date: {
                    [Op.not]: null,
                    [Op.lte]: new Date()
                }
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                },
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ],
            ...options
        };

        return await this.findAll(queryOptions);
    }

    /**
     * Find relationships involving a list of persons
     * 
     * @param {Array<String>} personIds - Array of person IDs
     * @param {Object} options - Query options including sortBy and sortOrder
     * @returns {Promise<Array>} Array of relationships
     */
    async findRelationshipsInvolvingPersons(personIds, options = {}) {
        const allowedSortFields = [
            'created_at', 'updated_at', 'relationship_type', 'start_date', 'end_date'
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

        queryOptions.where = {
            [Op.or]: [
                { person1_id: { [Op.in]: personIds } },
                { person2_id: { [Op.in]: personIds } }
            ]
        };

        queryOptions.include = [
            {
                model: Person,
                as: 'person1',
                attributes: ['person_id', 'first_name', 'last_name']
            },
            {
                model: Person,
                as: 'person2',
                attributes: ['person_id', 'first_name', 'last_name']
            }
        ];

        return await this.findAll(queryOptions);
    }
}

module.exports = new RelationshipRepository();
