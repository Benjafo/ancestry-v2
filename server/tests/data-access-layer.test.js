// No need to import expect as it's globally available in Jest
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const personRepository = require('../repositories/personRepository');
const relationshipRepository = require('../repositories/relationshipRepository');
const personService = require('../services/personService');
const relationshipService = require('../services/relationshipService');
const TransactionManager = require('../utils/transactionManager');
const QueryBuilder = require('../utils/queryBuilder');
const { v4: uuidv4 } = require('uuid');

/**
 * Test suite for the data access layer
 * 
 * Note: These tests require a running database with the correct schema.
 * They are intended to be run in a development environment, not in CI/CD.
 */
describe('Data Access Layer', () => {
    // Set Jest timeout for all tests in this file
    jest.setTimeout(10000);
    
    // Test data
    const testPerson1 = {
        person_id: uuidv4(),
        first_name: 'John',
        last_name: 'Doe',
        gender: 'male',
        birth_date: '1950-01-01'
    };
    
    const testPerson2 = {
        person_id: uuidv4(),
        first_name: 'Jane',
        last_name: 'Doe',
        gender: 'female',
        birth_date: '1952-05-15'
    };
    
    const testPerson3 = {
        person_id: uuidv4(),
        first_name: 'Michael',
        last_name: 'Doe',
        gender: 'male',
        birth_date: '1975-10-20'
    };
    
    // Clean up test data before and after tests
    beforeAll(async () => {
        // Connect to the database
        try {
            await sequelize.authenticate();
            console.log('Database connection established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
        
        // Clean up any existing test data
        await cleanupTestData();
    });
    
    afterAll(async () => {
        // Clean up test data
        await cleanupTestData();
    });
    
    // Helper function to clean up test data
    async function cleanupTestData() {
        await TransactionManager.executeTransaction(async (transaction) => {
            // Delete test relationships
            await relationshipRepository.bulkDelete({
                where: {
                    [Op.or]: [
                        { person1_id: [testPerson1.person_id, testPerson2.person_id, testPerson3.person_id] },
                        { person2_id: [testPerson1.person_id, testPerson2.person_id, testPerson3.person_id] }
                    ]
                }
            }, { transaction });
            
            // Delete test persons
            await personRepository.bulkDelete({
                where: {
                    person_id: [testPerson1.person_id, testPerson2.person_id, testPerson3.person_id]
                }
            }, { transaction });
        });
    }
    
    describe('Repository Layer', () => {
        describe('BaseRepository', () => {
            test('should provide common CRUD operations', async () => {
                // Create a test person
                const person = await personRepository.create(testPerson1);
                expect(typeof person).toBe('object');
                expect(person.person_id).toBe(testPerson1.person_id);
                
                // Find the person by ID
                const foundPerson = await personRepository.findById(testPerson1.person_id);
                expect(typeof foundPerson).toBe('object');
                expect(foundPerson.person_id).toBe(testPerson1.person_id);
                
                // Update the person
                const updatedPerson = await personRepository.update(testPerson1.person_id, {
                    middle_name: 'Robert'
                });
                expect(typeof updatedPerson).toBe('object');
                expect(updatedPerson.middle_name).toBe('Robert');
                
                // Delete the person
                const deleted = await personRepository.delete(testPerson1.person_id);
                expect(deleted).toBe(true);
                
                // Verify the person is deleted
                const deletedPerson = await personRepository.findById(testPerson1.person_id);
                expect(deletedPerson).toBeNull();
                
                // Recreate the person for subsequent tests
                await personRepository.create(testPerson1);
            });
        });
        
        describe('PersonRepository', () => {
            beforeAll(async () => {
                // Create test persons
                await personRepository.create(testPerson2);
                await personRepository.create(testPerson3);
            });
            
            test('should find persons with pagination and filtering', async () => {
                const result = await personRepository.findPersons({
                    page: 1,
                    pageSize: 10,
                    gender: 'male'
                });
                
                expect(typeof result).toBe('object');
                expect(Array.isArray(result.persons)).toBe(true);
                expect(typeof result.metadata).toBe('object');
                expect(result.persons.some(p => p.person_id === testPerson1.person_id)).toBe(true);
                expect(result.persons.some(p => p.person_id === testPerson3.person_id)).toBe(true);
                expect(result.persons.every(p => p.gender === 'male')).toBe(true);
            });
            
            test('should find a person by ID with related data', async () => {
                // Create a parent-child relationship
                await relationshipRepository.create({
                    relationship_id: uuidv4(),
                    person1_id: testPerson1.person_id,
                    person2_id: testPerson3.person_id,
                    relationship_type: 'parent'
                });
                
                // Find the person with relationships
                const person = await personRepository.findPersonById(testPerson1.person_id, {
                    includeRelationships: true
                });
                
                expect(typeof person).toBe('object');
                expect(Array.isArray(person.relationshipsAsSubject)).toBe(true);
                expect(person.relationshipsAsSubject.length).toBeGreaterThanOrEqual(1);
                expect(typeof person.relationshipsAsSubject[0].person2).toBe('object');
                expect(person.relationshipsAsSubject[0].person2.person_id).toBe(testPerson3.person_id);
            });
            
            test('should find family members', async () => {
                // Create a spouse relationship
                await relationshipRepository.create({
                    relationship_id: uuidv4(),
                    person1_id: testPerson1.person_id,
                    person2_id: testPerson2.person_id,
                    relationship_type: 'spouse',
                    start_date: '1974-06-15'
                });
                
                // Find family members
                const familyMembers = await personRepository.findFamilyMembers(testPerson1.person_id);
                
                expect(typeof familyMembers).toBe('object');
                expect(Array.isArray(familyMembers.children)).toBe(true);
                expect(familyMembers.children.length).toBeGreaterThanOrEqual(1);
                expect(familyMembers.children[0].person_id).toBe(testPerson3.person_id);
                
                expect(Array.isArray(familyMembers.spouses)).toBe(true);
                expect(familyMembers.spouses.length).toBeGreaterThanOrEqual(1);
                expect(familyMembers.spouses[0].person.person_id).toBe(testPerson2.person_id);
            });
        });
        
        describe('RelationshipRepository', () => {
            test('should find relationships with pagination and filtering', async () => {
                const result = await relationshipRepository.findRelationships({
                    page: 1,
                    pageSize: 10,
                    relationshipType: 'parent'
                });
                
                expect(typeof result).toBe('object');
                expect(Array.isArray(result.relationships)).toBe(true);
                expect(typeof result.metadata).toBe('object');
                expect(result.relationships.length).toBeGreaterThanOrEqual(1);
                expect(result.relationships.every(r => r.relationship_type === 'parent')).toBe(true);
            });
            
            test('should find relationships by person ID', async () => {
                const relationships = await relationshipRepository.findByPersonId(testPerson1.person_id);
                
                expect(Array.isArray(relationships)).toBe(true);
                expect(relationships.length).toBeGreaterThanOrEqual(2); // Parent and spouse relationships
                expect(relationships.some(r => r.relationship_type === 'parent')).toBe(true);
                expect(relationships.some(r => r.relationship_type === 'spouse')).toBe(true);
            });
            
            test('should find relationships between two persons', async () => {
                const relationships = await relationshipRepository.findBetweenPersons(
                    testPerson1.person_id,
                    testPerson2.person_id
                );
                
                expect(Array.isArray(relationships)).toBe(true);
                expect(relationships.length).toBeGreaterThanOrEqual(1);
                expect(relationships[0].relationship_type).toBe('spouse');
            });
        });
    });
    
    describe('Service Layer', () => {
        describe('PersonService', () => {
            test('should get persons with pagination and filtering', async () => {
                const result = await personService.getPersons({
                    page: 1,
                    pageSize: 10,
                    gender: 'female'
                });
                
                expect(typeof result).toBe('object');
                expect(Array.isArray(result.persons)).toBe(true);
                expect(typeof result.metadata).toBe('object');
                expect(result.persons.some(p => p.person_id === testPerson2.person_id)).toBe(true);
                expect(result.persons.every(p => p.gender === 'female')).toBe(true);
            });
            
            test('should get a person by ID with related data', async () => {
                const person = await personService.getPersonById(testPerson1.person_id, {
                    includeRelationships: true
                });
                
                expect(typeof person).toBe('object');
                expect(Array.isArray(person.relationshipsAsSubject)).toBe(true);
                expect(person.relationshipsAsSubject.length).toBeGreaterThanOrEqual(1);
            });
            
            test('should get family members', async () => {
                const familyMembers = await personService.getFamilyMembers(testPerson1.person_id);
                
                expect(typeof familyMembers).toBe('object');
                expect(Array.isArray(familyMembers.children)).toBe(true);
                expect(Array.isArray(familyMembers.spouses)).toBe(true);
            });
            
            test('should get ancestors', async () => {
                const ancestors = await personService.getAncestors(testPerson3.person_id);
                
                expect(typeof ancestors).toBe('object');
                expect(Array.isArray(ancestors.parents)).toBe(true);
                expect(ancestors.parents.length).toBeGreaterThanOrEqual(1);
                expect(ancestors.parents[0].id).toBe(testPerson1.person_id);
            });
            
            test('should get descendants', async () => {
                const descendants = await personService.getDescendants(testPerson1.person_id);
                
                expect(typeof descendants).toBe('object');
                expect(Array.isArray(descendants.children)).toBe(true);
                expect(descendants.children.length).toBeGreaterThanOrEqual(1);
                expect(descendants.children[0].id).toBe(testPerson3.person_id);
            });
        });
        
        describe('RelationshipService', () => {
            test('should get relationships with pagination and filtering', async () => {
                const result = await relationshipService.getRelationships({
                    page: 1,
                    pageSize: 10,
                    relationshipType: 'spouse'
                });
                
                expect(typeof result).toBe('object');
                expect(Array.isArray(result.relationships)).toBe(true);
                expect(typeof result.metadata).toBe('object');
                expect(result.relationships.length).toBeGreaterThanOrEqual(1);
                expect(result.relationships.every(r => r.relationship_type === 'spouse')).toBe(true);
            });
            
            test('should get relationships by person ID', async () => {
                const relationships = await relationshipService.getRelationshipsByPersonId(testPerson1.person_id);
                
                expect(Array.isArray(relationships)).toBe(true);
                expect(relationships.length).toBeGreaterThanOrEqual(2); // Parent and spouse relationships
            });
            
            test('should get relationships between two persons', async () => {
                const relationships = await relationshipService.getRelationshipsBetweenPersons(
                    testPerson1.person_id,
                    testPerson2.person_id
                );
                
                expect(Array.isArray(relationships)).toBe(true);
                expect(relationships.length).toBeGreaterThanOrEqual(1);
                expect(relationships[0].relationship_type).toBe('spouse');
            });
            
            test('should find relationship path between two persons', async () => {
                const path = await relationshipService.findRelationshipPath(
                    testPerson2.person_id,
                    testPerson3.person_id
                );
                
                expect(Array.isArray(path)).toBe(true);
                expect(path.length).toBeGreaterThanOrEqual(1);
            });
        });
    });
    
    describe('Utility Classes', () => {
        describe('TransactionManager', () => {
            test('should execute a function within a transaction', async () => {
                const result = await TransactionManager.executeTransaction(async (transaction) => {
                    // Create a temporary person
                    const tempPerson = await personRepository.create({
                        person_id: uuidv4(),
                        first_name: 'Temp',
                        last_name: 'Person',
                        gender: 'other'
                    }, { transaction });
                    
                    // Delete the temporary person
                    await personRepository.delete(tempPerson.person_id, { transaction });
                    
                    return { success: true };
                });
                
                expect(typeof result).toBe('object');
                expect(result.success).toBe(true);
            });
        });
        
        describe('QueryBuilder', () => {
            test('should build pagination options', () => {
                const options = QueryBuilder.buildPaginationOptions({
                    page: 2,
                    pageSize: 10
                });
                
                expect(typeof options).toBe('object');
                expect(options.limit).toBe(10);
                expect(options.offset).toBe(10);
            });
            
            test('should build sorting options', () => {
                const options = QueryBuilder.buildSortingOptions(
                    { sortBy: 'birth_date', sortOrder: 'desc' },
                    ['first_name', 'last_name', 'birth_date']
                );
                
                expect(Array.isArray(options)).toBe(true);
                expect(options[0][0]).toBe('birth_date');
                expect(options[0][1]).toBe('DESC');
            });
            
            test('should build filter options', () => {
                const options = QueryBuilder.buildFilterOptions({
                    gender: 'male',
                    birth_date: { gt: '1900-01-01' }
                });
                
                expect(typeof options).toBe('object');
                expect(options.gender).toBe('male');
                expect(typeof options.birth_date).toBe('object');
                expect(options.birth_date[Op.gt]).toBe('1900-01-01');
            });
            
            test('should build complete query options', () => {
                const options = QueryBuilder.buildQueryOptions(
                    {
                        page: 1,
                        pageSize: 10,
                        sortBy: 'last_name',
                        sortOrder: 'asc',
                        gender: 'male'
                    },
                    {
                        allowedSortFields: ['first_name', 'last_name', 'birth_date'],
                        searchFields: ['first_name', 'last_name']
                    }
                );
                
                expect(typeof options).toBe('object');
                expect(options.limit).toBe(10);
                expect(options.offset).toBe(0);
                expect(Array.isArray(options.order)).toBe(true);
                expect(typeof options.where).toBe('object');
                expect(options.where.gender).toBe('male');
            });
        });
    });
});
