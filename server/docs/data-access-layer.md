# Data Access Layer Documentation

This document provides an overview of the data access layer architecture implemented in the Ancestry Research Service application.

## Architecture Overview

The data access layer follows a multi-layered architecture to separate concerns and provide a clean, maintainable codebase:

```
┌─────────────┐
│   Routes    │
└─────┬───────┘
      │
┌─────▼───────┐
│ Controllers │
└─────┬───────┘
      │
┌─────▼───────┐
│  Services   │
└─────┬───────┘
      │
┌─────▼───────┐
│Repositories │
└─────┬───────┘
      │
┌─────▼───────┐
│   Models    │
└─────┬───────┘
      │
┌─────▼───────┐
│  Database   │
└─────────────┘
```

### Layers

1. **Routes**: Define API endpoints and connect them to controller methods.
2. **Controllers**: Handle HTTP requests and responses, delegating business logic to services.
3. **Services**: Implement business logic and orchestrate data access through repositories.
4. **Repositories**: Provide data access methods and abstract database operations.
5. **Models**: Define data structures and relationships using Sequelize ORM.
6. **Database**: PostgreSQL database storing the application data.

## Components

### Base Repository

The `BaseRepository` class provides common CRUD operations for all repositories:

```javascript
const baseRepo = new BaseRepository(Model);

// Common operations
await baseRepo.findAll(options);
await baseRepo.findById(id, options);
await baseRepo.findOne(options);
await baseRepo.create(data, options);
await baseRepo.update(id, data, options);
await baseRepo.delete(id, options);
await baseRepo.count(options);
await baseRepo.findAndCountAll(options);
await baseRepo.bulkCreate(data, options);
await baseRepo.bulkUpdate(data, options);
await baseRepo.bulkDelete(options);
```

### Entity Repositories

Entity-specific repositories extend the `BaseRepository` and add specialized methods:

- **PersonRepository**: Methods for person-related operations
- **RelationshipRepository**: Methods for relationship-related operations

### Services

Services implement business logic and use repositories for data access:

- **PersonService**: Business logic for person-related operations
- **RelationshipService**: Business logic for relationship-related operations

### Utilities

- **TransactionManager**: Manages database transactions
- **QueryBuilder**: Builds complex queries with pagination, sorting, and filtering

## Usage Examples

### Repository Layer

```javascript
// Using the PersonRepository
const personRepository = require('../repositories/personRepository');

// Find persons with pagination and filtering
const result = await personRepository.findPersons({
    page: 1,
    pageSize: 10,
    sortBy: 'last_name',
    sortOrder: 'asc',
    gender: 'male',
    birthDateStart: '1900-01-01',
    birthDateEnd: '1950-12-31'
});

// Find a person by ID with related data
const person = await personRepository.findPersonById(personId, {
    includeEvents: true,
    includeRelationships: true,
    includeDocuments: true
});

// Find family members
const familyMembers = await personRepository.findFamilyMembers(personId);
```

### Service Layer

```javascript
// Using the PersonService
const personService = require('../services/personService');

// Create a new person
const person = await personService.createPerson({
    first_name: 'John',
    last_name: 'Doe',
    gender: 'male',
    birth_date: '1950-01-01'
});

// Update a person
const updatedPerson = await personService.updatePerson(personId, {
    first_name: 'Jonathan'
});

// Add a parent-child relationship
const relationship = await personService.addParentChildRelationship(
    parentId,
    childId,
    { relationship_qualifier: 'biological' }
);

// Get ancestors
const ancestors = await personService.getAncestors(personId, 3);
```

### Transaction Management

```javascript
const TransactionManager = require('../utils/transactionManager');

// Execute a function within a transaction
const result = await TransactionManager.executeTransaction(async (transaction) => {
    // Perform multiple operations within the transaction
    const person = await personRepository.create(personData, { transaction });
    const relationship = await relationshipRepository.create(relationshipData, { transaction });
    
    return { person, relationship };
});

// Manually manage a transaction
const transaction = await TransactionManager.getTransaction();
try {
    // Perform operations
    await TransactionManager.commitTransaction(transaction);
} catch (error) {
    await TransactionManager.rollbackTransaction(transaction);
    throw error;
}
```

### Query Building

```javascript
const QueryBuilder = require('../utils/queryBuilder');

// Build pagination options
const paginationOptions = QueryBuilder.buildPaginationOptions({
    page: 2,
    pageSize: 10
});

// Build sorting options
const sortingOptions = QueryBuilder.buildSortingOptions(
    { sortBy: 'birth_date', sortOrder: 'desc' },
    ['first_name', 'last_name', 'birth_date', 'death_date']
);

// Build filter options
const filterOptions = QueryBuilder.buildFilterOptions({
    gender: 'female',
    birth_date: { gt: '1900-01-01', lt: '2000-01-01' }
});

// Build complete query options
const queryOptions = QueryBuilder.buildQueryOptions(
    {
        page: 1,
        pageSize: 10,
        sortBy: 'last_name',
        sortOrder: 'asc',
        search: 'Smith',
        gender: 'male'
    },
    {
        allowedSortFields: ['first_name', 'last_name', 'birth_date'],
        defaultSortField: 'last_name',
        searchFields: ['first_name', 'last_name', 'maiden_name']
    }
);
```

## Best Practices

1. **Use Services for Business Logic**: Keep controllers thin and delegate business logic to services.
2. **Use Repositories for Data Access**: Don't access models directly from services; use repositories instead.
3. **Use Transactions for Multi-Step Operations**: Wrap operations that modify multiple records in transactions.
4. **Validate Data**: Validate data at the service layer before passing it to repositories.
5. **Handle Errors**: Catch and handle errors at the appropriate layer.
6. **Use Query Builder**: Use the QueryBuilder utility for complex queries.
7. **Keep Controllers RESTful**: Follow RESTful principles in controller methods.

## Error Handling

Errors are propagated up the stack and handled at the appropriate layer:

1. **Repository Layer**: Logs errors and rethrows them.
2. **Service Layer**: Handles business logic errors and rethrows technical errors.
3. **Controller Layer**: Catches all errors and returns appropriate HTTP responses.

## Validation

Validation occurs at multiple levels:

1. **API Level**: Using express-validator middleware.
2. **Service Level**: Business logic validation.
3. **Repository Level**: Data integrity validation.
4. **Model Level**: Sequelize model validation.
5. **Database Level**: PostgreSQL constraints.

## Genealogy-Specific Features

The data access layer includes specialized methods for genealogical data:

1. **Family Tree Navigation**: Methods to find parents, children, siblings, and spouses.
2. **Ancestor and Descendant Retrieval**: Methods to build hierarchical family trees.
3. **Relationship Path Finding**: Algorithm to find the shortest relationship path between two persons.
4. **Historical Data Validation**: Validation rules specific to genealogical data.
