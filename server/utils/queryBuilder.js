const { Op } = require('sequelize');

/**
 * Query Builder
 * Provides utilities for building Sequelize queries
 */
class QueryBuilder {
    /**
     * Build pagination options
     * 
     * @param {Object} params - Pagination parameters
     * @param {Number} params.page - Page number (1-based)
     * @param {Number} params.pageSize - Number of items per page
     * @param {Number} params.limit - Maximum number of items to return (overrides pageSize)
     * @param {Number} params.offset - Number of items to skip (overrides page)
     * @returns {Object} Sequelize pagination options (limit, offset)
     */
    static buildPaginationOptions(params = {}) {
        const options = {};

        // If limit is provided, use it directly
        if (params.limit !== undefined && params.limit !== null) {
            options.limit = parseInt(params.limit, 10);
        }
        // Otherwise, use pageSize if provided
        else if (params.pageSize !== undefined && params.pageSize !== null) {
            options.limit = parseInt(params.pageSize, 10);
        }

        // If offset is provided, use it directly
        if (params.offset !== undefined && params.offset !== null) {
            options.offset = parseInt(params.offset, 10);
        }
        // Otherwise, calculate offset from page and pageSize/limit
        else if (params.page !== undefined && params.page !== null) {
            const page = parseInt(params.page, 10);
            const pageSize = options.limit || 10; // Default to 10 if limit is not set
            options.offset = (page - 1) * pageSize;
        }

        return options;
    }

    /**
     * Build sorting options
     * 
     * @param {Object} params - Sorting parameters
     * @param {String} params.sortBy - Field to sort by
     * @param {String} params.sortOrder - Sort order (asc or desc)
     * @param {Array} allowedFields - Fields that are allowed to be sorted by
     * @param {String} defaultSortBy - Default field to sort by
     * @param {String} defaultSortOrder - Default sort order
     * @returns {Array} Sequelize order option
     */
    static buildSortingOptions(params = {}, allowedFields = [], defaultSortBy = 'createdAt', defaultSortOrder = 'desc') {
        let sortBy = params.sortBy || defaultSortBy;
        let sortOrder = params.sortOrder || defaultSortOrder;

        // Validate sort field if allowedFields is provided
        if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
            sortBy = defaultSortBy;
        }

        // Validate sort order
        if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            sortOrder = defaultSortOrder;
        }

        return [[sortBy, sortOrder.toUpperCase()]];
    }

    /**
     * Build filter options
     * 
     * @param {Object} filters - Filter parameters
     * @param {Object} fieldMappings - Mappings from query params to database fields
     * @returns {Object} Sequelize where clause
     */
    static buildFilterOptions(filters = {}, fieldMappings = {}) {
        const where = {};

        Object.entries(filters).forEach(([key, value]) => {
            // Skip empty values
            if (value === undefined || value === null || value === '') {
                return;
            }

            // Get the database field name from mappings or use the key directly
            const fieldName = fieldMappings[key] || key;

            // Handle special operators
            if (typeof value === 'object' && !Array.isArray(value)) {
                const conditions = {};

                Object.entries(value).forEach(([op, val]) => {
                    switch (op) {
                        case 'eq':
                            conditions[Op.eq] = val;
                            break;
                        case 'ne':
                            conditions[Op.ne] = val;
                            break;
                        case 'gt':
                            conditions[Op.gt] = val;
                            break;
                        case 'gte':
                            conditions[Op.gte] = val;
                            break;
                        case 'lt':
                            conditions[Op.lt] = val;
                            break;
                        case 'lte':
                            conditions[Op.lte] = val;
                            break;
                        case 'like':
                            conditions[Op.like] = `%${val}%`;
                            break;
                        case 'notLike':
                            conditions[Op.notLike] = `%${val}%`;
                            break;
                        case 'in':
                            conditions[Op.in] = Array.isArray(val) ? val : [val];
                            break;
                        case 'notIn':
                            conditions[Op.notIn] = Array.isArray(val) ? val : [val];
                            break;
                        case 'between':
                            if (Array.isArray(val) && val.length === 2) {
                                conditions[Op.between] = val;
                            }
                            break;
                        case 'notBetween':
                            if (Array.isArray(val) && val.length === 2) {
                                conditions[Op.notBetween] = val;
                            }
                            break;
                    }
                });

                where[fieldName] = conditions;
            }
            // Handle array values (treat as IN operator)
            else if (Array.isArray(value)) {
                where[fieldName] = { [Op.in]: value };
            }
            // Handle string values with wildcards
            else if (typeof value === 'string' && (value.includes('*') || value.includes('%'))) {
                const likeValue = value.replace(/\*/g, '%');
                where[fieldName] = { [Op.like]: likeValue };
            }
            // Handle regular values (treat as equality)
            else {
                where[fieldName] = value;
            }
        });

        return where;
    }

    /**
     * Build search options for text search across multiple fields
     * 
     * @param {String} searchTerm - Search term
     * @param {Array} searchFields - Fields to search in
     * @returns {Object} Sequelize where clause for text search
     */
    static buildSearchOptions(searchTerm, searchFields = []) {
        if (!searchTerm || !searchFields.length) {
            return {};
        }

        const searchConditions = searchFields.map(field => ({
            [field]: { [Op.iLike]: `%${searchTerm}%` }
        }));

        return { [Op.or]: searchConditions };
    }

    /**
     * Build date range filter
     * 
     * @param {String|Date} startDate - Start date
     * @param {String|Date} endDate - End date
     * @param {String} dateField - Field to filter on
     * @returns {Object} Sequelize where clause for date range
     */
    static buildDateRangeFilter(startDate, endDate, dateField = 'createdAt') {
        const dateFilter = {};

        if (startDate) {
            dateFilter[Op.gte] = new Date(startDate);
        }

        if (endDate) {
            dateFilter[Op.lte] = new Date(endDate);
        }

        return Object.keys(dateFilter).length ? { [dateField]: dateFilter } : {};
    }

    /**
     * Build complete query options by combining pagination, sorting, and filtering
     * 
     * @param {Object} params - Query parameters
     * @param {Object} options - Additional options
     * @param {Array} options.allowedSortFields - Fields that are allowed to be sorted by
     * @param {String} options.defaultSortField - Default field to sort by
     * @param {String} options.defaultSortOrder - Default sort order
     * @param {Object} options.fieldMappings - Mappings from query params to database fields
     * @param {Array} options.searchFields - Fields to search in
     * @param {String} options.dateField - Field to use for date filtering
     * @returns {Object} Complete Sequelize query options
     */
    static buildQueryOptions(params = {}, options = {}) {
        const queryOptions = {};

        // Extract parameters
        const {
            page, pageSize, limit, offset,
            sortBy, sortOrder,
            search,
            startDate, endDate,
            ...filters
        } = params;

        // Add pagination
        Object.assign(queryOptions, this.buildPaginationOptions({ page, pageSize, limit, offset }));

        // Add sorting
        queryOptions.order = this.buildSortingOptions(
            { sortBy, sortOrder },
            options.allowedSortFields || [],
            options.defaultSortField || 'createdAt',
            options.defaultSortOrder || 'desc'
        );

        // Initialize where clause
        queryOptions.where = {};

        // Add filters
        const filterWhere = this.buildFilterOptions(filters, options.fieldMappings || {});
        Object.assign(queryOptions.where, filterWhere);

        // Add search
        if (search && options.searchFields && options.searchFields.length) {
            const searchWhere = this.buildSearchOptions(search, options.searchFields);
            queryOptions.where = {
                ...queryOptions.where,
                ...searchWhere
            };
        }

        // Add date range
        if ((startDate || endDate) && options.dateField) {
            const dateWhere = this.buildDateRangeFilter(startDate, endDate, options.dateField);
            queryOptions.where = {
                ...queryOptions.where,
                ...dateWhere
            };
        }

        // If where clause is effectively empty (no string-keyed properties from filters AND no symbol-keyed properties like Op.or from search)
        const hasStringKeys = Object.keys(queryOptions.where).length > 0;
        const hasSymbolKeys = Object.getOwnPropertySymbols(queryOptions.where).length > 0;

        if (!hasStringKeys && !hasSymbolKeys) {
            delete queryOptions.where;
        }

        return queryOptions;
    }
}

module.exports = QueryBuilder;
