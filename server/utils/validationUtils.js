/**
 * Utility functions for cross-entity validation
 */

/**
 * Validates chronological consistency between a person's birth/death dates and their events
 * @param {Object} person - The person object with birth_date and death_date properties
 * @param {Array} events - Array of event objects associated with the person
 * @returns {Object} - Object with isValid property and any errors
 */
exports.validatePersonEvents = (person, events) => {
    const errors = [];
    
    if (!person || !events || !Array.isArray(events)) {
        return { isValid: false, errors: ['Invalid input data'] };
    }
    
    const birthDate = person.birth_date ? new Date(person.birth_date) : null;
    const deathDate = person.death_date ? new Date(person.death_date) : null;
    
    // Check each event's date against person's birth and death dates
    events.forEach(event => {
        if (!event.event_date) return;
        
        const eventDate = new Date(event.event_date);
        
        // Birth event should match person's birth date
        if (event.event_type === 'birth' && birthDate) {
            if (eventDate.toISOString().split('T')[0] !== birthDate.toISOString().split('T')[0]) {
                errors.push(`Birth event date (${eventDate.toISOString().split('T')[0]}) does not match person's birth date (${birthDate.toISOString().split('T')[0]})`);
            }
        }
        
        // Death event should match person's death date
        if (event.event_type === 'death' && deathDate) {
            if (eventDate.toISOString().split('T')[0] !== deathDate.toISOString().split('T')[0]) {
                errors.push(`Death event date (${eventDate.toISOString().split('T')[0]}) does not match person's death date (${deathDate.toISOString().split('T')[0]})`);
            }
        }
        
        // Events other than birth should be after birth date
        if (event.event_type !== 'birth' && birthDate && eventDate < birthDate) {
            errors.push(`Event '${event.event_type}' date (${eventDate.toISOString().split('T')[0]}) is before person's birth date (${birthDate.toISOString().split('T')[0]})`);
        }
        
        // Events other than death should be before death date
        if (event.event_type !== 'death' && deathDate && eventDate > deathDate) {
            errors.push(`Event '${event.event_type}' date (${eventDate.toISOString().split('T')[0]}) is after person's death date (${deathDate.toISOString().split('T')[0]})`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates relationship consistency between two persons
 * @param {Object} relationship - The relationship object
 * @param {Object} person1 - The first person in the relationship
 * @param {Object} person2 - The second person in the relationship
 * @returns {Object} - Object with isValid property and any errors
 */
exports.validateRelationship = (relationship, person1, person2) => {
    const errors = [];
    
    if (!relationship || !person1 || !person2) {
        return { isValid: false, errors: ['Invalid input data'] };
    }
    
    const person1BirthDate = person1.birth_date ? new Date(person1.birth_date) : null;
    const person2BirthDate = person2.birth_date ? new Date(person2.birth_date) : null;
    
    // Parent-child relationship validation
    if (relationship.relationship_type === 'parent') {
        // Parent should be born before child
        if (person1BirthDate && person2BirthDate && person1BirthDate >= person2BirthDate) {
            errors.push('Parent must be born before child');
        }
        
        // Check reasonable age difference for parent-child (at least 10 years)
        if (person1BirthDate && person2BirthDate) {
            const ageDifference = (person2BirthDate - person1BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
            if (ageDifference < 10) {
                errors.push(`Parent-child age difference (${Math.round(ageDifference)} years) is unusually small`);
            }
            if (ageDifference > 70) {
                errors.push(`Parent-child age difference (${Math.round(ageDifference)} years) is unusually large`);
            }
        }
    }
    
    // Child-parent relationship validation (inverse of parent-child)
    if (relationship.relationship_type === 'child') {
        // Child should be born after parent
        if (person1BirthDate && person2BirthDate && person1BirthDate <= person2BirthDate) {
            errors.push('Child must be born after parent');
        }
        
        // Check reasonable age difference for child-parent (at least 10 years)
        if (person1BirthDate && person2BirthDate) {
            const ageDifference = (person1BirthDate - person2BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
            if (ageDifference < 10) {
                errors.push(`Child-parent age difference (${Math.round(ageDifference)} years) is unusually small`);
            }
            if (ageDifference > 70) {
                errors.push(`Child-parent age difference (${Math.round(ageDifference)} years) is unusually large`);
            }
        }
    }
    
    // Spouse relationship validation
    if (relationship.relationship_type === 'spouse') {
        // Marriage date should be after both spouses' birth dates
        if (relationship.start_date) {
            const marriageDate = new Date(relationship.start_date);
            
            if (person1BirthDate && marriageDate < person1BirthDate) {
                errors.push('Marriage date cannot be before first person\'s birth date');
            }
            
            if (person2BirthDate && marriageDate < person2BirthDate) {
                errors.push('Marriage date cannot be before second person\'s birth date');
            }
            
            // Check reasonable age for marriage (at least 14 years old)
            if (person1BirthDate) {
                const ageAtMarriage = (marriageDate - person1BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
                if (ageAtMarriage < 14) {
                    errors.push(`First person's age at marriage (${Math.round(ageAtMarriage)} years) is unusually young`);
                }
            }
            
            if (person2BirthDate) {
                const ageAtMarriage = (marriageDate - person2BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
                if (ageAtMarriage < 14) {
                    errors.push(`Second person's age at marriage (${Math.round(ageAtMarriage)} years) is unusually young`);
                }
            }
        }
    }
    
    // Sibling relationship validation
    if (relationship.relationship_type === 'sibling') {
        // Siblings should have reasonable age difference (less than 30 years)
        if (person1BirthDate && person2BirthDate) {
            const ageDifference = Math.abs(person1BirthDate - person2BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
            if (ageDifference > 30) {
                errors.push(`Sibling age difference (${Math.round(ageDifference)} years) is unusually large`);
            }
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Detects circular relationships in a family tree
 * @param {Array} relationships - Array of all relationships
 * @returns {Object} - Object with isValid property and any errors
 */
exports.detectCircularRelationships = (relationships) => {
    const errors = [];
    
    if (!relationships || !Array.isArray(relationships)) {
        return { isValid: false, errors: ['Invalid input data'] };
    }
    
    // Build a graph of parent-child relationships
    const graph = {};
    
    relationships.forEach(rel => {
        if (rel.relationship_type === 'parent') {
            if (!graph[rel.person1_id]) {
                graph[rel.person1_id] = [];
            }
            graph[rel.person1_id].push(rel.person2_id);
        } else if (rel.relationship_type === 'child') {
            if (!graph[rel.person2_id]) {
                graph[rel.person2_id] = [];
            }
            graph[rel.person2_id].push(rel.person1_id);
        }
    });
    
    // Check for cycles in the graph using DFS
    const visited = new Set();
    const recursionStack = new Set();
    
    function hasCycle(nodeId) {
        if (!graph[nodeId]) return false;
        
        visited.add(nodeId);
        recursionStack.add(nodeId);
        
        for (const neighbor of graph[nodeId]) {
            if (!visited.has(neighbor)) {
                if (hasCycle(neighbor)) {
                    return true;
                }
            } else if (recursionStack.has(neighbor)) {
                errors.push(`Circular relationship detected involving person ${nodeId} and ${neighbor}`);
                return true;
            }
        }
        
        recursionStack.delete(nodeId);
        return false;
    }
    
    // Check each node that hasn't been visited yet
    Object.keys(graph).forEach(nodeId => {
        if (!visited.has(nodeId)) {
            hasCycle(nodeId);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates document-person associations
 * @param {Object} document - The document object
 * @param {Object} person - The person object
 * @returns {Object} - Object with isValid property and any errors
 */
exports.validateDocumentPerson = (document, person) => {
    const errors = [];
    
    if (!document || !person) {
        return { isValid: false, errors: ['Invalid input data'] };
    }
    
    // Check if document date is within person's lifetime
    if (document.date_of_original) {
        const documentDate = new Date(document.date_of_original);
        const birthDate = person.birth_date ? new Date(person.birth_date) : null;
        const deathDate = person.death_date ? new Date(person.death_date) : null;
        
        // For birth certificates, the date should match the birth date
        if (document.document_type === 'certificate' && document.title.toLowerCase().includes('birth')) {
            if (birthDate && documentDate.toISOString().split('T')[0] !== birthDate.toISOString().split('T')[0]) {
                errors.push('Birth certificate date should match person\'s birth date');
            }
        }
        
        // For death certificates, the date should match the death date
        if (document.document_type === 'certificate' && document.title.toLowerCase().includes('death')) {
            if (deathDate && documentDate.toISOString().split('T')[0] !== deathDate.toISOString().split('T')[0]) {
                errors.push('Death certificate date should match person\'s death date');
            }
        }
        
        // Document date should be within person's lifetime (with some flexibility)
        if (birthDate && documentDate < new Date(birthDate.getTime() - 365 * 24 * 60 * 60 * 1000)) { // 1 year before birth
            errors.push('Document date is more than 1 year before person\'s birth');
        }
        
        if (deathDate && documentDate > new Date(deathDate.getTime() + 365 * 24 * 60 * 60 * 1000)) { // 1 year after death
            errors.push('Document date is more than 1 year after person\'s death');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
