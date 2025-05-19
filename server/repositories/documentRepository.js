const BaseRepository = require('./baseRepository');
const { Document, Person, DocumentPerson } = require('../models');
const { Op } = require('sequelize');
const QueryBuilder = require('../utils/queryBuilder');

/**
 * Document Repository
 * Handles data access operations for Document entities
 */
class DocumentRepository extends BaseRepository {
    /**
     * Constructor
     */
    constructor() {
        super(Document);
    }

    /**
     * Find documents with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @param {Number} params.page - Page number
     * @param {Number} params.pageSize - Page size
     * @param {String} params.sortBy - Sort field
     * @param {String} params.sortOrder - Sort order (asc/desc)
     * @param {String} params.search - Search term for title and description
     * @param {String} params.documentType - Filter by document type
     * @param {String} params.uploadDateStart - Filter by upload date (start)
     * @param {String} params.uploadDateEnd - Filter by upload date (end)
     * @param {String} params.originalDateStart - Filter by date of original (start)
     * @param {String} params.originalDateEnd - Filter by date of original (end)
     * @returns {Promise<Object>} Paginated result with documents and metadata
     */
    async findDocuments(params = {}) {
        // Define field mappings for query params to database fields
        const fieldMappings = {
            documentType: 'document_type',
            uploadDateStart: 'upload_date',
            uploadDateEnd: 'upload_date',
            originalDateStart: 'date_of_original',
            originalDateEnd: 'date_of_original'
        };
        
        // Define allowed sort fields
        const allowedSortFields = [
            'title', 'document_type', 'upload_date', 'date_of_original', 'created_at', 'updated_at'
        ];
        
        // Define search fields
        const searchFields = ['title', 'description', 'source'];
        
        // Build date range filters
        const dateFilters = {};
        
        if (params.uploadDateStart || params.uploadDateEnd) {
            dateFilters.upload_date = {};
            
            if (params.uploadDateStart) {
                dateFilters.upload_date[Op.gte] = new Date(params.uploadDateStart);
            }
            
            if (params.uploadDateEnd) {
                dateFilters.upload_date[Op.lte] = new Date(params.uploadDateEnd);
            }
        }
        
        if (params.originalDateStart || params.originalDateEnd) {
            dateFilters.date_of_original = {};
            
            if (params.originalDateStart) {
                dateFilters.date_of_original[Op.gte] = new Date(params.originalDateStart);
            }
            
            if (params.originalDateEnd) {
                dateFilters.date_of_original[Op.lte] = new Date(params.originalDateEnd);
            }
        }
        
        // Build query options
        const queryOptions = QueryBuilder.buildQueryOptions(
            {
                page: params.page,
                pageSize: params.pageSize,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
                search: params.search,
                documentType: params.documentType
            },
            {
                allowedSortFields,
                defaultSortField: 'upload_date',
                defaultSortOrder: 'desc',
                fieldMappings,
                searchFields
            }
        );
        
        // Add date filters
        if (Object.keys(dateFilters).length > 0) {
            queryOptions.where = {
                ...queryOptions.where,
                ...dateFilters
            };
        }
        
        // Add include for person data if requested
        if (params.includePersons) {
            queryOptions.include = [
                {
                    model: Person,
                    as: 'persons',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date'],
                    through: { attributes: ['relevance', 'notes'] }
                }
            ];
        }
        
        // Execute query
        const result = await this.findAndCountAll(queryOptions);
        
        // Calculate pagination metadata
        const page = parseInt(params.page, 10) || 1;
        const pageSize = parseInt(params.pageSize, 10) || 10;
        const totalPages = Math.ceil(result.count / pageSize);
        
        return {
            documents: result.rows,
            metadata: {
                totalCount: result.count,
                totalPages,
                currentPage: page,
                pageSize
            }
        };
    }

    /**
     * Find a document by ID with optional related data
     * 
     * @param {String} id - Document ID
     * @param {Object} options - Query options
     * @param {Boolean} options.includePersons - Include associated persons
     * @returns {Promise<Object>} Document with related data
     */
    async findDocumentById(id, options = {}) {
        const include = [];
        
        if (options.includePersons) {
            include.push({
                model: Person,
                as: 'persons',
                attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date'],
                through: { attributes: ['relevance', 'notes'] }
            });
        }
        
        return await this.findById(id, { include });
    }

    /**
     * Find documents by person ID
     * 
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async findDocumentsByPersonId(personId, options = {}) {
        const queryOptions = {
            include: [
                {
                    model: Person,
                    as: 'persons',
                    attributes: ['person_id'],
                    where: { person_id: personId },
                    through: { attributes: [] }
                }
            ],
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find documents by type
     * 
     * @param {String} documentType - Document type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async findDocumentsByType(documentType, options = {}) {
        const queryOptions = {
            where: {
                document_type: documentType
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find documents by date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {String} dateField - Date field to filter on (upload_date or date_of_original)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async findDocumentsByDateRange(startDate, endDate, dateField = 'upload_date', options = {}) {
        const queryOptions = {
            where: {
                [dateField]: {
                    [Op.between]: [startDate, endDate]
                }
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find documents by project ID
     * 
     * @param {String} projectId - Project ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async findDocumentsByProjectId(projectId, options = {}) {
        const queryOptions = {
            where: {
                project_id: projectId
            },
            ...options
        };
        
        // Include persons if requested
        if (options.includePersons) {
            queryOptions.include = [
                {
                    model: Person,
                    as: 'persons',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date'],
                    through: { attributes: ['relevance', 'notes'] }
                }
            ];
        }
        
        return await this.findAll(queryOptions);
    }

    /**
     * Associate a document with a person
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @param {Object} data - Association data (relevance, notes)
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Created association
     */
    async associateDocumentWithPerson(documentId, personId, data = {}, options = {}) {
        const association = await DocumentPerson.create({
            document_id: documentId,
            person_id: personId,
            relevance: data.relevance,
            notes: data.notes
        }, options);
        
        return association;
    }

    /**
     * Update document-person association
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @param {Object} data - Association data to update
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Updated association
     */
    async updateDocumentPersonAssociation(documentId, personId, data, options = {}) {
        const [count, [association]] = await DocumentPerson.update(data, {
            where: {
                document_id: documentId,
                person_id: personId
            },
            returning: true,
            ...options
        });
        
        if (count === 0) {
            throw new Error('Document-person association not found');
        }
        
        return association;
    }

    /**
     * Remove document-person association
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Boolean>} True if successful
     */
    async removeDocumentPersonAssociation(documentId, personId, options = {}) {
        const count = await DocumentPerson.destroy({
            where: {
                document_id: documentId,
                person_id: personId
            },
            ...options
        });
        
        return count > 0;
    }

    /**
     * Get document-person association
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Association data
     */
    async getDocumentPersonAssociation(documentId, personId, options = {}) {
        const association = await DocumentPerson.findOne({
            where: {
                document_id: documentId,
                person_id: personId
            },
            ...options
        });
        
        return association;
    }
}

module.exports = new DocumentRepository();
