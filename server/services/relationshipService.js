const relationshipRepository = require('../repositories/relationshipRepository');
const personRepository = require('../repositories/personRepository');
const TransactionManager = require('../utils/transactionManager');
const { validateMarriage } = require('../utils/genealogyRules');
const { validateRelationship, detectCircularRelationships } = require('../utils/validationUtils');
const { Person } = require('../models');

/**
 * Relationship Service
 * Handles business logic for Relationship entities
 */
class RelationshipService {
    /**
     * Get relationships with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated result with relationships and metadata
     */
    async getRelationships(params = {}) {
        return await relationshipRepository.findRelationships(params);
    }

    /**
     * Get a relationship by ID
     * 
     * @param {String} id - Relationship ID
     * @returns {Promise<Object>} Relationship with person data
     */
    async getRelationshipById(id) {
        return await relationshipRepository.findRelationshipById(id);
    }

    /**
     * Create a new relationship
     * 
     * @param {Object} relationshipData - Relationship data
     * @returns {Promise<Object>} Created relationship
     */
    async createRelationship(relationshipData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Enforce that only 'parent' and 'spouse' relationships can be created directly
            if (!['parent', 'spouse'].includes(relationshipData.relationship_type)) {
                throw new Error(`Only 'parent' and 'spouse' relationships can be created directly. Other relationship types are derived automatically.`);
            }
            
            // Get both persons' data
            const [person1, person2] = await Promise.all([
                personRepository.findById(relationshipData.person1_id, { transaction }),
                personRepository.findById(relationshipData.person2_id, { transaction })
            ]);
            
            if (!person1) {
                throw new Error(`Person with id ${relationshipData.person1_id} not found`);
            }
            
            if (!person2) {
                throw new Error(`Person with id ${relationshipData.person2_id} not found`);
            }
            
            // Check for existing relationships between these two people
            const existingRelationships = await relationshipRepository.findBetweenPersons(
                relationshipData.person1_id, 
                relationshipData.person2_id,
                { transaction }
            );
            
            // If there's an existing relationship of the same type, prevent duplication
            const duplicateRelationship = existingRelationships.find(rel => 
                (rel.relationship_type === relationshipData.relationship_type) ||
                // Also check for inverse relationships (parent-child)
                (rel.relationship_type === 'parent' && relationshipData.relationship_type === 'parent' && 
                 rel.person1_id === relationshipData.person2_id && rel.person2_id === relationshipData.person1_id)
            );
            
            if (duplicateRelationship) {
                throw new Error(`A relationship of type '${relationshipData.relationship_type}' already exists between these people`);
            }
            
            // Validate relationship based on type
            if (relationshipData.relationship_type === 'spouse') {
                const marriageValidation = validateMarriage(person1, person2, relationshipData);
                if (!marriageValidation.isValid) {
                    throw new Error(`Marriage validation failed: ${marriageValidation.warnings.join(', ')}`);
                }
            } else {
                const relationshipValidation = validateRelationship(relationshipData, person1, person2);
                if (!relationshipValidation.isValid) {
                    throw new Error(`Relationship validation failed: ${relationshipValidation.errors.join(', ')}`);
                }
            }
            
            // Check for circular relationships if this is a parent-child relationship
            if (relationshipData.relationship_type === 'parent') {
                // Get all existing relationships
                const allRelationships = await relationshipRepository.findAll({
                    where: {
                        relationship_type: ['parent', 'child']
                    }
                });
                
                // Add the new relationship to the list
                const relationshipsWithNew = [
                    ...allRelationships,
                    {
                        person1_id: relationshipData.person1_id,
                        person2_id: relationshipData.person2_id,
                        relationship_type: 'parent'
                    }
                ];
                
                // Check for circular relationships
                const circularCheck = detectCircularRelationships(relationshipsWithNew);
                if (!circularCheck.isValid) {
                    throw new Error(`Circular relationship detected: ${circularCheck.errors.join(', ')}`);
                }
            }
            
            // Create the relationship
            const relationship = await relationshipRepository.create(relationshipData, { transaction });
            
            // If this is a parent-child relationship, create the inverse relationship
            if (relationshipData.relationship_type === 'parent') {
                await relationshipRepository.create({
                    person1_id: relationshipData.person2_id,
                    person2_id: relationshipData.person1_id,
                    relationship_type: 'child',
                    relationship_qualifier: relationshipData.relationship_qualifier,
                    notes: relationshipData.notes
                }, { transaction });
            }
            
            return relationship;
        });
    }

    /**
     * Update a relationship
     * 
     * @param {String} id - Relationship ID
     * @param {Object} relationshipData - Relationship data to update
     * @returns {Promise<Object>} Updated relationship
     */
    async updateRelationship(id, relationshipData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get the current relationship data
            const currentRelationship = await relationshipRepository.findById(id, { transaction });
            if (!currentRelationship) {
                throw new Error(`Relationship with id ${id} not found`);
            }
            
            // Enforce that only 'parent' and 'spouse' relationships can be updated
            if (relationshipData.relationship_type && 
                !['parent', 'spouse'].includes(relationshipData.relationship_type)) {
                throw new Error(`Only 'parent' and 'spouse' relationships can be updated directly. Other relationship types are derived automatically.`);
            }
            
            // Get both persons' data
            const [person1, person2] = await Promise.all([
                personRepository.findById(currentRelationship.person1_id, { transaction }),
                personRepository.findById(currentRelationship.person2_id, { transaction })
            ]);
            
            // Merge current data with updates
            const updatedData = {
                ...currentRelationship.toJSON(),
                ...relationshipData
            };
            
            // Ensure the relationship type is still valid
            if (!['parent', 'spouse', 'child'].includes(updatedData.relationship_type)) {
                throw new Error(`Invalid relationship type. Only 'parent', 'child', and 'spouse' relationships are allowed.`);
            }
            
            // Validate relationship based on type
            if (updatedData.relationship_type === 'spouse') {
                const marriageValidation = validateMarriage(person1, person2, updatedData);
                if (!marriageValidation.isValid) {
                    throw new Error(`Marriage validation failed: ${marriageValidation.warnings.join(', ')}`);
                }
            } else {
                const relationshipValidation = validateRelationship(updatedData, person1, person2);
                if (!relationshipValidation.isValid) {
                    throw new Error(`Relationship validation failed: ${relationshipValidation.errors.join(', ')}`);
                }
            }
            
            // Update the relationship
            const relationship = await relationshipRepository.update(id, relationshipData, { transaction });
            
            // If this is a parent-child relationship and the qualifier changed, update the inverse relationship
            if (currentRelationship.relationship_type === 'parent' && relationshipData.relationship_qualifier) {
                // Find the inverse relationship
                const inverseRelationship = await relationshipRepository.findOne({
                    where: {
                        person1_id: currentRelationship.person2_id,
                        person2_id: currentRelationship.person1_id,
                        relationship_type: 'child'
                    }
                }, { transaction });
                
                if (inverseRelationship) {
                    await relationshipRepository.update(inverseRelationship.relationship_id, {
                        relationship_qualifier: relationshipData.relationship_qualifier
                    }, { transaction });
                }
            }
            
            return relationship;
        });
    }

    /**
     * Delete a relationship
     * 
     * @param {String} id - Relationship ID
     * @returns {Promise<Boolean>} True if successful
     */
    async deleteRelationship(id) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get the current relationship data
            const relationship = await relationshipRepository.findById(id, { transaction });
            if (!relationship) {
                throw new Error(`Relationship with id ${id} not found`);
            }
            
            // If this is a parent-child relationship, delete the inverse relationship
            if (relationship.relationship_type === 'parent') {
                // Find the inverse relationship
                const inverseRelationship = await relationshipRepository.findOne({
                    where: {
                        person1_id: relationship.person2_id,
                        person2_id: relationship.person1_id,
                        relationship_type: 'child'
                    }
                }, { transaction });
                
                if (inverseRelationship) {
                    await relationshipRepository.delete(inverseRelationship.relationship_id, { transaction });
                }
            } else if (relationship.relationship_type === 'child') {
                // Find the inverse relationship
                const inverseRelationship = await relationshipRepository.findOne({
                    where: {
                        person1_id: relationship.person2_id,
                        person2_id: relationship.person1_id,
                        relationship_type: 'parent'
                    }
                }, { transaction });
                
                if (inverseRelationship) {
                    await relationshipRepository.delete(inverseRelationship.relationship_id, { transaction });
                }
            }
            
            // Delete the relationship
            return await relationshipRepository.delete(id, { transaction });
        });
    }

    /**
     * Get relationships by person ID
     * 
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async getRelationshipsByPersonId(personId, options = {}) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        return await relationshipRepository.findByPersonId(personId, options);
    }

    /**
     * Get relationships by type
     * 
     * @param {String} type - Relationship type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async getRelationshipsByType(type, options = {}) {
        return await relationshipRepository.findByType(type, options);
    }

    /**
     * Get relationships by qualifier
     * 
     * @param {String} qualifier - Relationship qualifier
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async getRelationshipsByQualifier(qualifier, options = {}) {
        return await relationshipRepository.findByQualifier(qualifier, options);
    }

    /**
     * Get relationships between two persons
     * 
     * @param {String} person1Id - First person ID
     * @param {String} person2Id - Second person ID
     * @returns {Promise<Array>} Array of relationships
     */
    async getRelationshipsBetweenPersons(person1Id, person2Id) {
        // Check if both persons exist
        const [person1, person2] = await Promise.all([
            personRepository.findById(person1Id),
            personRepository.findById(person2Id)
        ]);
        
        if (!person1) {
            throw new Error(`Person with id ${person1Id} not found`);
        }
        
        if (!person2) {
            throw new Error(`Person with id ${person2Id} not found`);
        }
        
        return await relationshipRepository.findBetweenPersons(person1Id, person2Id);
    }

    /**
     * Get parent-child relationships
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of parent-child relationships
     */
    async getParentChildRelationships(options = {}) {
        return await relationshipRepository.findParentChildRelationships(options);
    }

    /**
     * Get spouse relationships
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of spouse relationships
     */
    async getSpouseRelationships(options = {}) {
        return await relationshipRepository.findSpouseRelationships(options);
    }

    /**
     * Get relationships by date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {String} dateField - Date field to filter on (start_date or end_date)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of relationships
     */
    async getRelationshipsByDateRange(startDate, endDate, dateField = 'start_date', options = {}) {
        return await relationshipRepository.findByDateRange(startDate, endDate, dateField, options);
    }

    /**
     * Get active relationships (no end date or end date in the future)
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of active relationships
     */
    async getActiveRelationships(options = {}) {
        return await relationshipRepository.findActiveRelationships(options);
    }

    /**
     * Get ended relationships (has end date in the past)
     * 
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of ended relationships
     */
    async getEndedRelationships(options = {}) {
        return await relationshipRepository.findEndedRelationships(options);
    }

    /**
     * Find the relationship path between two persons
     * 
     * @param {String} person1Id - First person ID
     * @param {String} person2Id - Second person ID
     * @param {Number} maxDepth - Maximum depth to search (default: 5)
     * @returns {Promise<Array>} Array of relationships forming the path
     */
    async findRelationshipPath(person1Id, person2Id, maxDepth = 5) {
        // Check if both persons exist
        const [person1, person2] = await Promise.all([
            personRepository.findById(person1Id),
            personRepository.findById(person2Id)
        ]);
        
        if (!person1) {
            throw new Error(`Person with id ${person1Id} not found`);
        }
        
        if (!person2) {
            throw new Error(`Person with id ${person2Id} not found`);
        }
        
        // Get all relationships
        const allRelationships = await relationshipRepository.findAll({
            include: [
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
            ]
        });
        
        // Build a graph of relationships
        const graph = {};
        
        allRelationships.forEach(rel => {
            // Add edge from person1 to person2
            if (!graph[rel.person1_id]) {
                graph[rel.person1_id] = [];
            }
            
            graph[rel.person1_id].push({
                personId: rel.person2_id,
                relationship: rel
            });
            
            // Add edge from person2 to person1
            if (!graph[rel.person2_id]) {
                graph[rel.person2_id] = [];
            }
            
            graph[rel.person2_id].push({
                personId: rel.person1_id,
                relationship: rel
            });
        });
        
        // Perform BFS to find the shortest path
        const queue = [{
            personId: person1Id,
            path: [],
            visited: new Set([person1Id])
        }];
        
        while (queue.length > 0) {
            const { personId, path, visited } = queue.shift();
            
            // If we've reached the target person, return the path
            if (personId === person2Id) {
                return path;
            }
            
            // If we've reached the maximum depth, skip this path
            if (path.length >= maxDepth) {
                continue;
            }
            
            // Explore neighbors
            const neighbors = graph[personId] || [];
            
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.personId)) {
                    const newVisited = new Set(visited);
                    newVisited.add(neighbor.personId);
                    
                    queue.push({
                        personId: neighbor.personId,
                        path: [...path, neighbor.relationship],
                        visited: newVisited
                    });
                }
            }
        }
        
        // If no path is found, return an empty array
        return [];
    }
}

module.exports = new RelationshipService();
