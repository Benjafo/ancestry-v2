const BaseRepository = require('./baseRepository');
const { Person, Event, Relationship, Document } = require('../models');
const { Op } = require('sequelize');
const QueryBuilder = require('../utils/queryBuilder');

/**
 * Person Repository
 * Handles data access operations for Person entities
 */
class PersonRepository extends BaseRepository {
    /**
     * Constructor
     */
    constructor() {
        super(Person);
    }

    /**
     * Find persons with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @param {Number} params.page - Page number
     * @param {Number} params.pageSize - Page size
     * @param {String} params.sortBy - Sort field
     * @param {String} params.sortOrder - Sort order (asc/desc)
     * @param {String} params.search - Search term for name fields
     * @param {String} params.gender - Filter by gender
     * @param {String} params.birthDateStart - Filter by birth date (start)
     * @param {String} params.birthDateEnd - Filter by birth date (end)
     * @param {String} params.deathDateStart - Filter by death date (start)
     * @param {String} params.deathDateEnd - Filter by death date (end)
     * @returns {Promise<Object>} Paginated result with persons and metadata
     */
    async findPersons(params = {}) {
        // Define field mappings for query params to database fields
        const fieldMappings = {
            birthDateStart: 'birth_date',
            birthDateEnd: 'birth_date',
            deathDateStart: 'death_date',
            deathDateEnd: 'death_date'
        };
        
        // Define allowed sort fields
        const allowedSortFields = [
            'first_name', 'last_name', 'birth_date', 'death_date', 'gender', 'created_at', 'updated_at'
        ];
        
        // Define search fields
        const searchFields = ['first_name', 'middle_name', 'last_name', 'maiden_name'];
        
        // Build date range filters
        const dateFilters = {};
        
        if (params.birthDateStart || params.birthDateEnd) {
            dateFilters.birth_date = {};
            
            if (params.birthDateStart) {
                dateFilters.birth_date[Op.gte] = new Date(params.birthDateStart);
            }
            
            if (params.birthDateEnd) {
                dateFilters.birth_date[Op.lte] = new Date(params.birthDateEnd);
            }
        }
        
        if (params.deathDateStart || params.deathDateEnd) {
            dateFilters.death_date = {};
            
            if (params.deathDateStart) {
                dateFilters.death_date[Op.gte] = new Date(params.deathDateStart);
            }
            
            if (params.deathDateEnd) {
                dateFilters.death_date[Op.lte] = new Date(params.deathDateEnd);
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
                gender: params.gender
            },
            {
                allowedSortFields,
                defaultSortField: 'last_name',
                defaultSortOrder: 'asc',
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
        
        // Execute query
        const result = await this.findAndCountAll(queryOptions);
        
        // Calculate pagination metadata
        const page = parseInt(params.page, 10) || 1;
        const pageSize = parseInt(params.pageSize, 10) || 10;
        const totalPages = Math.ceil(result.count / pageSize);
        
        return {
            persons: result.rows,
            metadata: {
                totalCount: result.count,
                totalPages,
                currentPage: page,
                pageSize
            }
        };
    }

    /**
     * Find a person by ID with optional related data
     * 
     * @param {String} id - Person ID
     * @param {Object} options - Query options
     * @param {Boolean} options.includeEvents - Include events
     * @param {Boolean} options.includeRelationships - Include relationships
     * @param {Boolean} options.includeDocuments - Include documents
     * @returns {Promise<Object>} Person with related data
     */
    async findPersonById(id, options = {}) {
        const include = [];
        
        if (options.includeEvents) {
            include.push({
                model: Event,
                as: 'events',
                required: false
            });
        }
        
        if (options.includeRelationships) {
            include.push(
                {
                    model: Relationship,
                    as: 'relationshipsAsSubject',
                    required: false,
                    include: [
                        {
                            model: Person,
                            as: 'person2',
                            attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                        }
                    ]
                },
                {
                    model: Relationship,
                    as: 'relationshipsAsObject',
                    required: false,
                    include: [
                        {
                            model: Person,
                            as: 'person1',
                            attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                        }
                    ]
                }
            );
        }
        
        if (options.includeDocuments) {
            include.push({
                model: Document,
                as: 'documents',
                required: false,
                through: { attributes: [] } // Exclude junction table attributes
            });
        }
        
        return await this.findById(id, { include });
    }

    /**
     * Find parents of a person
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Array>} Array of parent persons
     */
    async findParents(personId) {
        const parentRelationships = await Relationship.findAll({
            where: {
                person2_id: personId,
                relationship_type: 'parent'
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
        
        return parentRelationships.map(rel => rel.person1);
    }

    /**
     * Find children of a person
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Array>} Array of child persons
     */
    async findChildren(personId) {
        const childRelationships = await Relationship.findAll({
            where: {
                person1_id: personId,
                relationship_type: 'parent'
            },
            include: [
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
        
        return childRelationships.map(rel => rel.person2);
    }

    /**
     * Find siblings of a person
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Array>} Array of sibling persons
     */
    async findSiblings(personId) {
        // Find parents first
        const parents = await this.findParents(personId);
        const parentIds = parents.map(parent => parent.person_id);
        
        if (parentIds.length === 0) {
            return [];
        }
        
        // Find all children of these parents (siblings)
        const siblingRelationships = await Relationship.findAll({
            where: {
                person1_id: { [Op.in]: parentIds },
                relationship_type: 'parent',
                person2_id: { [Op.ne]: personId } // Exclude the person themselves
            },
            include: [
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
        
        // Get unique siblings (a person might have multiple parents)
        const siblings = siblingRelationships.map(rel => rel.person2);
        const uniqueSiblings = [];
        const seenIds = new Set();
        
        siblings.forEach(sibling => {
            if (!seenIds.has(sibling.person_id)) {
                seenIds.add(sibling.person_id);
                uniqueSiblings.push(sibling);
            }
        });
        
        return uniqueSiblings;
    }

    /**
     * Find spouses of a person
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Array>} Array of spouse persons with relationship details
     */
    async findSpouses(personId) {
        // Find relationships where person is person1
        const spouseRelationships1 = await Relationship.findAll({
            where: {
                person1_id: personId,
                relationship_type: 'spouse'
            },
            include: [
                {
                    model: Person,
                    as: 'person2',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
        
        // Find relationships where person is person2
        const spouseRelationships2 = await Relationship.findAll({
            where: {
                person2_id: personId,
                relationship_type: 'spouse'
            },
            include: [
                {
                    model: Person,
                    as: 'person1',
                    attributes: ['person_id', 'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'death_date']
                }
            ]
        });
        
        // Combine and format results
        const spouses = [
            ...spouseRelationships1.map(rel => ({
                person: rel.person2,
                relationship: {
                    relationship_id: rel.relationship_id,
                    relationship_type: rel.relationship_type,
                    relationship_qualifier: rel.relationship_qualifier,
                    start_date: rel.start_date,
                    end_date: rel.end_date
                }
            })),
            ...spouseRelationships2.map(rel => ({
                person: rel.person1,
                relationship: {
                    relationship_id: rel.relationship_id,
                    relationship_type: rel.relationship_type,
                    relationship_qualifier: rel.relationship_qualifier,
                    start_date: rel.start_date,
                    end_date: rel.end_date
                }
            }))
        ];
        
        return spouses;
    }

    /**
     * Find all family members of a person (including derived relationships)
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Object>} Object with family members grouped by relationship type
     */
    async findFamilyMembers(personId) {
        // Get direct relationships from database
        const [parents, children, spouses] = await Promise.all([
            this.findParents(personId),
            this.findChildren(personId),
            this.findSpouses(personId)
        ]);
        
        // Calculate siblings (people who share at least one parent)
        const siblings = await this.findSiblings(personId);
        
        // Calculate derived relationships
        const grandparents = await this._findGrandparents(personId, parents);
        const grandchildren = await this._findGrandchildren(personId, children);
        const auntsUncles = await this._findAuntsUncles(personId, parents);
        const niecesNephews = await this._findNiecesNephews(personId, siblings);
        const cousins = await this._findCousins(personId, parents);
        
        return {
            parents,
            children,
            siblings,
            spouses,
            grandparents,
            grandchildren,
            auntsUncles,
            niecesNephews,
            cousins
        };
    }
    
    /**
     * Find grandparents of a person
     * 
     * @param {String} personId - Person ID
     * @param {Array} parents - Array of parent persons (optional, to avoid duplicate queries)
     * @returns {Promise<Array>} Array of grandparent persons
     * @private
     */
    async _findGrandparents(personId, parentsParam = null) {
        // Use provided parents or fetch them
        const parents = parentsParam || await this.findParents(personId);
        
        if (parents.length === 0) {
            return [];
        }
        
        // Get parents of each parent (grandparents)
        const grandparentsPromises = parents.map(parent => this.findParents(parent.person_id));
        const grandparentArrays = await Promise.all(grandparentsPromises);
        
        // Flatten and deduplicate grandparents
        const allGrandparents = grandparentArrays.flat();
        const uniqueGrandparents = [];
        const seenIds = new Set();
        
        allGrandparents.forEach(grandparent => {
            if (!seenIds.has(grandparent.person_id)) {
                seenIds.add(grandparent.person_id);
                uniqueGrandparents.push(grandparent);
            }
        });
        
        return uniqueGrandparents;
    }
    
    /**
     * Find grandchildren of a person
     * 
     * @param {String} personId - Person ID
     * @param {Array} children - Array of child persons (optional, to avoid duplicate queries)
     * @returns {Promise<Array>} Array of grandchild persons
     * @private
     */
    async _findGrandchildren(personId, childrenParam = null) {
        // Use provided children or fetch them
        const children = childrenParam || await this.findChildren(personId);
        
        if (children.length === 0) {
            return [];
        }
        
        // Get children of each child (grandchildren)
        const grandchildrenPromises = children.map(child => this.findChildren(child.person_id));
        const grandchildrenArrays = await Promise.all(grandchildrenPromises);
        
        // Flatten and deduplicate grandchildren
        const allGrandchildren = grandchildrenArrays.flat();
        const uniqueGrandchildren = [];
        const seenIds = new Set();
        
        allGrandchildren.forEach(grandchild => {
            if (!seenIds.has(grandchild.person_id)) {
                seenIds.add(grandchild.person_id);
                uniqueGrandchildren.push(grandchild);
            }
        });
        
        return uniqueGrandchildren;
    }
    
    /**
     * Find aunts and uncles of a person
     * 
     * @param {String} personId - Person ID
     * @param {Array} parents - Array of parent persons (optional, to avoid duplicate queries)
     * @returns {Promise<Array>} Array of aunt/uncle persons
     * @private
     */
    async _findAuntsUncles(personId, parentsParam = null) {
        // Use provided parents or fetch them
        const parents = parentsParam || await this.findParents(personId);
        
        if (parents.length === 0) {
            return [];
        }
        
        // Get siblings of each parent (aunts/uncles)
        const auntsUnclesPromises = parents.map(parent => this.findSiblings(parent.person_id));
        const auntsUnclesArrays = await Promise.all(auntsUnclesPromises);
        
        // Flatten and deduplicate aunts/uncles
        const allAuntsUncles = auntsUnclesArrays.flat();
        const uniqueAuntsUncles = [];
        const seenIds = new Set();
        
        allAuntsUncles.forEach(auntUncle => {
            if (!seenIds.has(auntUncle.person_id)) {
                seenIds.add(auntUncle.person_id);
                uniqueAuntsUncles.push(auntUncle);
            }
        });
        
        return uniqueAuntsUncles;
    }
    
    /**
     * Find nieces and nephews of a person
     * 
     * @param {String} personId - Person ID
     * @param {Array} siblings - Array of sibling persons (optional, to avoid duplicate queries)
     * @returns {Promise<Array>} Array of niece/nephew persons
     * @private
     */
    async _findNiecesNephews(personId, siblingsParam = null) {
        // Use provided siblings or fetch them
        const siblings = siblingsParam || await this.findSiblings(personId);
        
        if (siblings.length === 0) {
            return [];
        }
        
        // Get children of each sibling (nieces/nephews)
        const niecesNephewsPromises = siblings.map(sibling => this.findChildren(sibling.person_id));
        const niecesNephewsArrays = await Promise.all(niecesNephewsPromises);
        
        // Flatten and deduplicate nieces/nephews
        const allNiecesNephews = niecesNephewsArrays.flat();
        const uniqueNiecesNephews = [];
        const seenIds = new Set();
        
        allNiecesNephews.forEach(nieceNephew => {
            if (!seenIds.has(nieceNephew.person_id)) {
                seenIds.add(nieceNephew.person_id);
                uniqueNiecesNephews.push(nieceNephew);
            }
        });
        
        return uniqueNiecesNephews;
    }
    
    /**
     * Find cousins of a person
     * 
     * @param {String} personId - Person ID
     * @param {Array} parents - Array of parent persons (optional, to avoid duplicate queries)
     * @returns {Promise<Array>} Array of cousin persons
     * @private
     */
    async _findCousins(personId, parentsParam = null) {
        // Use provided parents or fetch them
        const parents = parentsParam || await this.findParents(personId);
        
        if (parents.length === 0) {
            return [];
        }
        
        // Get aunts/uncles
        const auntsUncles = await this._findAuntsUncles(personId, parents);
        
        if (auntsUncles.length === 0) {
            return [];
        }
        
        // Get children of each aunt/uncle (cousins)
        const cousinsPromises = auntsUncles.map(auntUncle => this.findChildren(auntUncle.person_id));
        const cousinsArrays = await Promise.all(cousinsPromises);
        
        // Flatten and deduplicate cousins
        const allCousins = cousinsArrays.flat();
        const uniqueCousins = [];
        const seenIds = new Set();
        
        allCousins.forEach(cousin => {
            if (!seenIds.has(cousin.person_id)) {
                seenIds.add(cousin.person_id);
                uniqueCousins.push(cousin);
            }
        });
        
        return uniqueCousins;
    }

    /**
     * Find persons by name (partial match on first, middle, or last name)
     * 
     * @param {String} name - Name to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByName(name, options = {}) {
        const searchOptions = {
            where: {
                [Op.or]: [
                    { first_name: { [Op.iLike]: `%${name}%` } },
                    { middle_name: { [Op.iLike]: `%${name}%` } },
                    { last_name: { [Op.iLike]: `%${name}%` } },
                    { maiden_name: { [Op.iLike]: `%${name}%` } }
                ]
            },
            ...options
        };
        
        return await this.findAll(searchOptions);
    }

    /**
     * Find persons born in a date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByBirthDateRange(startDate, endDate, options = {}) {
        const dateOptions = {
            where: {
                birth_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            ...options
        };
        
        return await this.findAll(dateOptions);
    }

    /**
     * Find persons who died in a date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByDeathDateRange(startDate, endDate, options = {}) {
        const dateOptions = {
            where: {
                death_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            ...options
        };
        
        return await this.findAll(dateOptions);
    }

    /**
     * Find persons by location (birth or death location)
     * 
     * @param {String} location - Location to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByLocation(location, options = {}) {
        const locationOptions = {
            where: {
                [Op.or]: [
                    { birth_location: { [Op.iLike]: `%${location}%` } },
                    { death_location: { [Op.iLike]: `%${location}%` } }
                ]
            },
            ...options
        };
        
        return await this.findAll(locationOptions);
    }
}

module.exports = new PersonRepository();
