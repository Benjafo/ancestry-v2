// client/src/utils/formValidation.ts
import { ApiRelationship } from '../api/client';
import { STATES_BY_COUNTRY } from './locationData'; // Import STATES_BY_COUNTRY

// Generic validation functions
export const validateRequired = (value: string, fieldName: string): string | undefined => {
    if (!value || value.trim() === '') {
        return `${fieldName} is required`;
    }
    return undefined;
};

export const validateEmail = (email: string): string | undefined => {
    if (!email) {
        return 'Email is required';
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return 'Email is invalid';
    }
    return undefined;
};

export const validatePasswordStrength = (password: string): string | undefined => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return undefined;
};

export const validateMinLength = (value: string, min: number, fieldName: string): string | undefined => {
    if (value && value.length < min) {
        return `${fieldName} must be at least ${min} characters`;
    }
    return undefined;
};

export const validateMaxLength = (value: string, max: number, fieldName: string): string | undefined => {
    if (value && value.length > max) {
        return `${fieldName} must be at most ${max} characters`;
    }
    return undefined;
};

export const validateLengthRange = (value: string, min: number, max: number, fieldName: string): string | undefined => {
    if (value && (value.length < min || value.length > max)) {
        return `${fieldName} must be between ${min} and ${max} characters`;
    }
    return undefined;
};

export const validateDate = (dateString: string, fieldName: string): string | undefined => {
    if (!dateString) {
        return `${fieldName} is required`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return `${fieldName} must be a valid date`;
    }
    return undefined;
};

export const validateDateRange = (startDate: string, endDate: string, startFieldName: string, endFieldName: string): string | undefined => {
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
            return `${endFieldName} cannot be before ${startFieldName}`;
        }
    }
    return undefined;
};

export const validateFutureDate = (dateString: string, fieldName: string): string | undefined => {
    if (dateString) {
        const date = new Date(dateString);
        if (date > new Date()) {
            return `${fieldName} cannot be in the future`;
        }
    }
    return undefined;
};

// Specific validation for roles
export const validateRole = (role: string): string | undefined => {
    if (!role) {
        return 'Role is required';
    }
    if (!['client', 'manager'].includes(role)) {
        return 'Role must be either "client" or "manager"';
    }
    return undefined;
};

// Specific validation for gender
export const validateGender = (gender: string): string | undefined => {
    if (!gender) {
        return 'Gender is required';
    }
    if (!['male', 'female', 'other', 'unknown'].includes(gender)) {
        return 'Gender must be one of: male, female, other, unknown';
    }
    return undefined;
};

// Specific validation for phone numbers (basic example)
export const validatePhone = (phone: string): string | undefined => {
    if (phone && !/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
        return 'Invalid phone number format';
    }
    return undefined;
};

// Specific validation for zip codes (basic example)
export const validateZipCode = (zipCode: string): string | undefined => {
    if (zipCode && !/^[0-9]{5}(?:-[0-9]{4})?$/.test(zipCode)) {
        return 'Invalid zip code format (e.g., 12345 or 12345-6789)';
    }
    return undefined;
};

// Specific validation for address fields
export const validateAddress = (address: string): string | undefined => {
    if (address && address.length < 3) {
        return 'Address must be at least 3 characters long';
    }
    return undefined;
};

export const validateCity = (city: string): string | undefined => {
    if (city && city.length < 2) {
        return 'City must be at least 2 characters long';
    }
    return undefined;
};

export const validateState = (state: string, country: string): string | undefined => {
    if (!state) {
        return undefined; // Not required if no country is selected or if it's an optional field
    }

    if (country && STATES_BY_COUNTRY[country]) {
        const validStates = STATES_BY_COUNTRY[country];
        const isValidState = validStates.some(s => s.code === state || s.name.toLowerCase() === state.toLowerCase());
        if (!isValidState) {
            return `Invalid State/Province for ${country}`;
        }
    } else if (state.length < 2) {
        return 'State/Province must be at least 2 characters long';
    }
    return undefined;
};

export const validateCountry = (country: string): string | undefined => {
    if (country && country.length < 2) {
        return 'Country must be at least 2 characters long';
    }
    return undefined;
};

// Group validation for address fields
export const validateAddressGroup = (address: string, city: string, state: string, zipCode: string, country: string): string | undefined => {
    const isAnyFieldFilled = !!(address || city || state || zipCode || country);

    if (isAnyFieldFilled) {
        let error: string | undefined;

        error = validateRequired(address, 'Street Address');
        if (error) return error;
        error = validateRequired(city, 'City');
        if (error) return error;
        error = validateRequired(state, 'State/Province');
        if (error) return error;
        error = validateRequired(zipCode, 'ZIP/Postal Code');
        if (error) return error;
        error = validateRequired(country, 'Country');
        if (error) return error;
    }
    return undefined;
};

// Consolidated validation for person dates (birth/death)
export const validatePersonDates = (birthDate: string, deathDate: string): string | undefined => {
    let error: string | undefined;

    error = validateDate(birthDate, 'Birth date');
    if (error) return error;

    error = validateFutureDate(birthDate, 'Birth date');
    if (error) return error;

    if (deathDate) {
        error = validateDate(deathDate, 'Death date');
        if (error) return error;

        error = validateFutureDate(deathDate, 'Death date');
        if (error) return error;

        error = validateDateRange(birthDate, deathDate, 'birth date', 'death date');
        if (error) return error;
    }

    return undefined;
};

// Consolidated validation for relationship dates
export const validateRelationshipDates = (startDate: string, endDate: string, relationshipType: string): string | undefined => {
    let error: string | undefined;

    if (relationshipType === 'spouse') {
        error = validateRequired(startDate, 'Marriage date (start date)');
        if (error) return error;
    }

    if (startDate) {
        error = validateDate(startDate, 'Start date');
        if (error) return error;
    }

    if (endDate) {
        error = validateDate(endDate, 'End date');
        if (error) return error;
    }

    error = validateDateRange(startDate, endDate, 'start date', 'end date');
    if (error) return error;

    return undefined;
};

// Placeholder for genealogy-specific rules (from genealogyRules.js)
// These would typically be more complex and might involve querying existing data
export const validateAge = (birthDate: string, deathDate?: string): string | undefined => {
    if (!birthDate) return undefined;

    const birthYear = new Date(birthDate).getFullYear();
    const currentOrDeathYear = deathDate ? new Date(deathDate).getFullYear() : new Date().getFullYear();
    const age = currentOrDeathYear - birthYear;

    if (age > 120) {
        return 'Age exceeds 120 years. Please verify dates.';
    }
    return undefined;
};

export const validateParentChildAgeDifference = (parentBirthDate: string, childBirthDate: string): string | undefined => {
    if (!parentBirthDate || !childBirthDate) return undefined;

    const parentAgeAtChildBirth = new Date(childBirthDate).getFullYear() - new Date(parentBirthDate).getFullYear();

    if (parentAgeAtChildBirth < 13) {
        return 'Parent cannot be younger than 13 years at child\'s birth.';
    }
    if (parentAgeAtChildBirth > 60) { // Arbitrary upper limit for plausibility
        return 'Parent seems unusually old at child\'s birth. Please verify dates.';
    }
    return undefined;
};

// Placeholder for relationship-specific validations (from validationUtils.js)
// These might involve checking for circular relationships or other complex rules
export const detectCircularRelationships = (person1Id: string, person2Id: string, existingRelationships: ApiRelationship[]): boolean => {
    console.log('Detecting circular relationships between:', person1Id, person2Id);
    console.log('Existing relationships:', existingRelationships);

    // This is a simplified placeholder. A real implementation would require a graph traversal algorithm
    // to check for cycles in the relationship graph.
    // For example, if A is parent of B, and B is parent of C, then C cannot be parent of A.
    // This would involve building an adjacency list/matrix and running DFS/BFS.
    console.warn('Circular relationship detection is a complex feature and this is a placeholder. A full implementation requires graph traversal.');

    // Basic check: if person1 is already an ancestor of person2, then person2 cannot be an ancestor of person1
    // This would require a recursive check through existing relationships.
    // For now, we'll just return false to allow relationships, but a real implementation needs this.
    return false;
};

export const validateRelationship = (
    person1Id: string,
    person2Id: string,
    relationshipType: string,
    existingRelationships: ApiRelationship[]
): string | undefined => {
    if (person1Id === person2Id) {
        return 'Person 1 and Person 2 cannot be the same.';
    }

    // Check for direct duplicates (same type, same two people in either order)
    const isDuplicate = existingRelationships.some(rel =>
        (rel.person1_id === person1Id && rel.person2_id === person2Id && rel.relationship_type === relationshipType) ||
        (rel.person1_id === person2Id && rel.person2_id === person1Id && rel.relationship_type === relationshipType)
    );
    if (isDuplicate) {
        return `A relationship of type '${relationshipType}' already exists between these people.`;
    }

    // Check for inverse relationships (e.g., if A is parent of B, B cannot be parent of A)
    if (relationshipType === 'parent') {
        const isChildOf = existingRelationships.some(rel =>
            rel.person1_id === person2Id && rel.person2_id === person1Id && rel.relationship_type === 'child'
        );
        if (isChildOf) {
            return `${person1Id} is already a child of ${person2Id}. Cannot add as parent.`;
        }
    } else if (relationshipType === 'child') {
        const isParentOf = existingRelationships.some(rel =>
            rel.person1_id === person2Id && rel.person2_id === person1Id && rel.relationship_type === 'parent'
        );
        if (isParentOf) {
            return `${person1Id} is already a parent of ${person2Id}. Cannot add as child.`;
        }
    }

    // Check for circular relationships (more complex, requires graph traversal)
    if (detectCircularRelationships(person1Id, person2Id, existingRelationships)) {
        return 'This relationship would create a circular family tree, which is not allowed.';
    }

    return undefined;
};

// Placeholder for document-person association validation
export const validateDocumentPerson = (documentId: string, personId: string, existingAssociations: any[]): string | undefined => {
    // This is a simplified placeholder. In a real scenario, you might check if the document is already associated
    // with the person, or if there are any constraints on document types per person.
    const isAlreadyAssociated = existingAssociations.some(assoc =>
        assoc.document_id === documentId && assoc.person_id === personId
    );
    if (isAlreadyAssociated) {
        return 'This document is already associated with this person.';
    }
    return undefined;
};
