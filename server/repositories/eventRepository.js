const BaseRepository = require('./baseRepository');
const { Event, Person } = require('../models');
const { Op } = require('sequelize');
const QueryBuilder = require('../utils/queryBuilder');

/**
 * Event Repository
 * Handles data access operations for Event entities
 */
class EventRepository extends BaseRepository {
    /**
     * Constructor
     */
    constructor() {
        super(Event);
    }

    /**
     * Find events with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @param {Number} params.page - Page number
     * @param {Number} params.pageSize - Page size
     * @param {String} params.sortBy - Sort field
     * @param {String} params.sortOrder - Sort order (asc/desc)
     * @param {String} params.search - Search term for description
     * @param {String} params.eventType - Filter by event type
     * @param {String} params.eventDateStart - Filter by event date (start)
     * @param {String} params.eventDateEnd - Filter by event date (end)
     * @param {String} params.location - Filter by event location
     * @returns {Promise<Object>} Paginated result with events and metadata
     */
    async findEvents(params = {}) {
        // Define field mappings for query params to database fields
        const fieldMappings = {
            eventType: 'event_type',
            eventDateStart: 'event_date',
            eventDateEnd: 'event_date',
            location: 'event_location'
        };
        
        // Define allowed sort fields
        const allowedSortFields = [
            'event_type', 'event_date', 'event_location', 'created_at', 'updated_at'
        ];
        
        // Define search fields
        const searchFields = ['description', 'event_location'];
        
        // Build date range filters
        const dateFilters = {};
        
        if (params.eventDateStart || params.eventDateEnd) {
            dateFilters.event_date = {};
            
            if (params.eventDateStart) {
                dateFilters.event_date[Op.gte] = new Date(params.eventDateStart);
            }
            
            if (params.eventDateEnd) {
                dateFilters.event_date[Op.lte] = new Date(params.eventDateEnd);
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
                eventType: params.eventType
            },
            {
                allowedSortFields,
                defaultSortField: 'event_date',
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
        
        // Add location filter if provided
        if (params.location) {
            queryOptions.where = {
                ...queryOptions.where,
                event_location: { [Op.iLike]: `%${params.location}%` }
            };
        }
        
        // Add include for person data if requested
        if (params.includePerson) {
            queryOptions.include = [
                {
                    model: Person,
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
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
            events: result.rows,
            metadata: {
                totalCount: result.count,
                totalPages,
                currentPage: page,
                pageSize
            }
        };
    }

    /**
     * Find an event by ID with optional related data
     * 
     * @param {String} id - Event ID
     * @param {Object} options - Query options
     * @param {Boolean} options.includePerson - Include person data
     * @returns {Promise<Object>} Event with related data
     */
    async findEventById(id, options = {}) {
        const include = [];
        
        if (options.includePerson) {
            include.push({
                model: Person,
                attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
            });
        }
        
        return await this.findById(id, { include });
    }

    /**
     * Find events by person ID
     * 
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async findEventsByPersonId(personId, options = {}) {
        const queryOptions = {
            where: {
                person_id: personId
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find events by type
     * 
     * @param {String} eventType - Event type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async findEventsByType(eventType, options = {}) {
        const queryOptions = {
            where: {
                event_type: eventType
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find events by date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async findEventsByDateRange(startDate, endDate, options = {}) {
        const queryOptions = {
            where: {
                event_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find events by location
     * 
     * @param {String} location - Location to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async findEventsByLocation(location, options = {}) {
        const queryOptions = {
            where: {
                event_location: { [Op.iLike]: `%${location}%` }
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }

    /**
     * Find events by person and type
     * 
     * @param {String} personId - Person ID
     * @param {String} eventType - Event type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async findEventsByPersonAndType(personId, eventType, options = {}) {
        const queryOptions = {
            where: {
                person_id: personId,
                event_type: eventType
            },
            ...options
        };
        
        return await this.findAll(queryOptions);
    }
}

module.exports = new EventRepository();
