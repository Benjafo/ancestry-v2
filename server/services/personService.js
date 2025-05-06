const personRepository = require('../repositories/personRepository');
const relationshipRepository = require('../repositories/relationshipRepository');
const TransactionManager = require('../utils/transactionManager');
const { validateAge, validateParentChildAgeDifference } = require('../utils/genealogyRules');
const { validatePersonEvents, validateRelationship } = require('../utils/validationUtils');

/**
 * Person Service
 * Handles business logic for Person entities
 */
class PersonService {
    /**
     * Get persons with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated result with persons and metadata
     */
    async getPersons(params = {}) {
        return await personRepository.findPersons(params);
    }

    /**
     * Get a person by ID with optional related data
     * 
     * @param {String} id - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Person with related data
     */
    async getPersonById(id, options = {}) {
        return await personRepository.findPersonById(id, options);
    }

    /**
     * Create a new person
     * 
     * @param {Object} personData - Person data
     * @returns {Promise<Object>} Created person
     */
    async createPerson(personData) {
        // Validate age
        const ageValidation = validateAge(personData);
        if (!ageValidation.isValid) {
            throw new Error(`Age validation failed: ${ageValidation.warnings.join(', ')}`);
        }
        
        return await TransactionManager.executeTransaction(async (transaction) => {
            const person = await personRepository.create(personData, { transaction });
            return person;
        });
    }

    /**
     * Update a person
     * 
     * @param {String} id - Person ID
     * @param {Object} personData - Person data to update
     * @returns {Promise<Object>} Updated person
     */
    async updatePerson(id, personData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get the current person data
            const currentPerson = await personRepository.findById(id, { transaction });
            if (!currentPerson) {
                throw new Error(`Person with id ${id} not found`);
            }
            
            // Merge current data with updates
            const updatedData = {
                ...currentPerson.toJSON(),
                ...personData
            };
            
            // Validate age
            const ageValidation = validateAge(updatedData);
            if (!ageValidation.isValid) {
                throw new Error(`Age validation failed: ${ageValidation.warnings.join(', ')}`);
            }
            
            // Update the person
            const person = await personRepository.update(id, personData, { transaction });
            return person;
        });
    }

    /**
     * Delete a person
     * 
     * @param {String} id - Person ID
     * @returns {Promise<Boolean>} True if successful
     */
    async deletePerson(id) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if person exists
            const person = await personRepository.findById(id, { transaction });
            if (!person) {
                throw new Error(`Person with id ${id} not found`);
            }
            
            // Delete the person
            return await personRepository.delete(id, { transaction });
        });
    }

    /**
     * Get family members of a person
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Object>} Object with family members grouped by relationship type
     */
    async getFamilyMembers(personId) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        return await personRepository.findFamilyMembers(personId);
    }

    /**
     * Add a parent-child relationship
     * 
     * @param {String} parentId - Parent person ID
     * @param {String} childId - Child person ID
     * @param {Object} relationshipData - Additional relationship data
     * @returns {Promise<Object>} Created relationship
     */
    async addParentChildRelationship(parentId, childId, relationshipData = {}) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get parent and child data
            const [parent, child] = await Promise.all([
                personRepository.findById(parentId, { transaction }),
                personRepository.findById(childId, { transaction })
            ]);
            
            if (!parent) {
                throw new Error(`Parent with id ${parentId} not found`);
            }
            
            if (!child) {
                throw new Error(`Child with id ${childId} not found`);
            }
            
            // Validate parent-child age difference
            const ageValidation = validateParentChildAgeDifference(parent, child);
            if (!ageValidation.isValid) {
                throw new Error(`Parent-child age validation failed: ${ageValidation.warnings.join(', ')}`);
            }
            
            // Create the relationship
            const relationship = await relationshipRepository.create({
                person1_id: parentId,
                person2_id: childId,
                relationship_type: 'parent',
                relationship_qualifier: relationshipData.relationship_qualifier || 'biological',
                notes: relationshipData.notes
            }, { transaction });
            
            return relationship;
        });
    }

    /**
     * Add a spouse relationship
     * 
     * @param {String} person1Id - First person ID
     * @param {String} person2Id - Second person ID
     * @param {Object} relationshipData - Additional relationship data
     * @returns {Promise<Object>} Created relationship
     */
    async addSpouseRelationship(person1Id, person2Id, relationshipData = {}) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get both persons' data
            const [person1, person2] = await Promise.all([
                personRepository.findById(person1Id, { transaction }),
                personRepository.findById(person2Id, { transaction })
            ]);
            
            if (!person1) {
                throw new Error(`Person with id ${person1Id} not found`);
            }
            
            if (!person2) {
                throw new Error(`Person with id ${person2Id} not found`);
            }
            
            // Check if a spouse relationship already exists
            const existingRelationships = await relationshipRepository.findBetweenPersons(person1Id, person2Id);
            const existingSpouseRelationship = existingRelationships.find(rel => rel.relationship_type === 'spouse');
            
            if (existingSpouseRelationship) {
                throw new Error('A spouse relationship already exists between these persons');
            }
            
            // Create the relationship
            const relationship = await relationshipRepository.create({
                person1_id: person1Id,
                person2_id: person2Id,
                relationship_type: 'spouse',
                relationship_qualifier: relationshipData.relationship_qualifier,
                start_date: relationshipData.start_date,
                end_date: relationshipData.end_date,
                notes: relationshipData.notes
            }, { transaction });
            
            return relationship;
        });
    }

    /**
     * Add a sibling relationship
     * 
     * @param {String} person1Id - First person ID
     * @param {String} person2Id - Second person ID
     * @param {Object} relationshipData - Additional relationship data
     * @returns {Promise<Object>} Created relationship
     */
    async addSiblingRelationship(person1Id, person2Id, relationshipData = {}) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get both persons' data
            const [person1, person2] = await Promise.all([
                personRepository.findById(person1Id, { transaction }),
                personRepository.findById(person2Id, { transaction })
            ]);
            
            if (!person1) {
                throw new Error(`Person with id ${person1Id} not found`);
            }
            
            if (!person2) {
                throw new Error(`Person with id ${person2Id} not found`);
            }
            
            // Check if a sibling relationship already exists
            const existingRelationships = await relationshipRepository.findBetweenPersons(person1Id, person2Id);
            const existingSiblingRelationship = existingRelationships.find(rel => rel.relationship_type === 'sibling');
            
            if (existingSiblingRelationship) {
                throw new Error('A sibling relationship already exists between these persons');
            }
            
            // Create the relationship
            const relationship = await relationshipRepository.create({
                person1_id: person1Id,
                person2_id: person2Id,
                relationship_type: 'sibling',
                relationship_qualifier: relationshipData.relationship_qualifier,
                notes: relationshipData.notes
            }, { transaction });
            
            return relationship;
        });
    }

    /**
     * Find persons by name
     * 
     * @param {String} name - Name to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByName(name, options = {}) {
        return await personRepository.findByName(name, options);
    }

    /**
     * Find persons by birth date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByBirthDateRange(startDate, endDate, options = {}) {
        return await personRepository.findByBirthDateRange(startDate, endDate, options);
    }

    /**
     * Find persons by death date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByDeathDateRange(startDate, endDate, options = {}) {
        return await personRepository.findByDeathDateRange(startDate, endDate, options);
    }

    /**
     * Find persons by location
     * 
     * @param {String} location - Location to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of matching persons
     */
    async findByLocation(location, options = {}) {
        return await personRepository.findByLocation(location, options);
    }

    /**
     * Get ancestors of a person
     * 
     * @param {String} personId - Person ID
     * @param {Number} generations - Number of generations to retrieve (default: 3)
     * @returns {Promise<Object>} Hierarchical object with ancestors
     */
    async getAncestors(personId, generations = 3) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        // Base case: if generations is 0 or person has no data, return basic info
        if (generations <= 0) {
            return {
                id: person.person_id,
                name: `${person.first_name} ${person.last_name}`,
                birth_date: person.birth_date,
                death_date: person.death_date,
                gender: person.gender
            };
        }
        
        // Get parents
        const parents = await personRepository.findParents(personId);
        
        // Recursively get ancestors for each parent
        const parentAncestors = await Promise.all(
            parents.map(async (parent) => {
                const ancestors = await this.getAncestors(parent.person_id, generations - 1);
                return ancestors;
            })
        );
        
        // Return person with their ancestors
        return {
            id: person.person_id,
            name: `${person.first_name} ${person.last_name}`,
            birth_date: person.birth_date,
            death_date: person.death_date,
            gender: person.gender,
            parents: parentAncestors
        };
    }

    /**
     * Get descendants of a person
     * 
     * @param {String} personId - Person ID
     * @param {Number} generations - Number of generations to retrieve (default: 3)
     * @returns {Promise<Object>} Hierarchical object with descendants
     */
    async getDescendants(personId, generations = 3) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        // Base case: if generations is 0 or person has no data, return basic info
        if (generations <= 0) {
            return {
                id: person.person_id,
                name: `${person.first_name} ${person.last_name}`,
                birth_date: person.birth_date,
                death_date: person.death_date,
                gender: person.gender
            };
        }
        
        // Get children
        const children = await personRepository.findChildren(personId);
        
        // Recursively get descendants for each child
        const childDescendants = await Promise.all(
            children.map(async (child) => {
                const descendants = await this.getDescendants(child.person_id, generations - 1);
                return descendants;
            })
        );
        
        // Return person with their descendants
        return {
            id: person.person_id,
            name: `${person.first_name} ${person.last_name}`,
            birth_date: person.birth_date,
            death_date: person.death_date,
            gender: person.gender,
            children: childDescendants
        };
    }
}

module.exports = new PersonService();
