/**
 * Business rules for genealogical data
 */

/**
 * Validates a person's age
 * @param {Object} person - The person object with birth_date and death_date properties
 * @returns {Object} - Object with isValid property and any warnings
 */
exports.validateAge = (person) => {
    const warnings = [];
    
    if (!person) {
        return { isValid: false, warnings: ['Invalid person data'] };
    }
    
    const birthDate = person.birth_date ? new Date(person.birth_date) : null;
    const deathDate = person.death_date ? new Date(person.death_date) : null;
    
    // Check if birth date is in the future
    if (birthDate && birthDate > new Date()) {
        warnings.push('Birth date is in the future');
    }
    
    // Check if death date is in the future
    if (deathDate && deathDate > new Date()) {
        warnings.push('Death date is in the future');
    }
    
    // Check if death date is before birth date
    if (birthDate && deathDate && deathDate < birthDate) {
        warnings.push('Death date is before birth date');
    }
    
    // Calculate age at death
    if (birthDate && deathDate) {
        const ageInYears = (deathDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Flag unusually high ages (over 120 years)
        if (ageInYears > 120) {
            warnings.push(`Age at death (${Math.round(ageInYears)} years) exceeds 120 years. Please verify dates.`);
        }
        
        // Flag unusually low ages (under 1 year)
        if (ageInYears < 1) {
            warnings.push(`Age at death (${Math.round(ageInYears * 12)} months) is under 1 year. Consider adding more precise dates if available.`);
        }
    }
    
    // Calculate current age for living persons
    if (birthDate && !deathDate) {
        const ageInYears = (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Flag unusually high ages for living persons (over 110 years)
        if (ageInYears > 110) {
            warnings.push(`Current age (${Math.round(ageInYears)} years) exceeds 110 years. Please verify birth date or add death date if applicable.`);
        }
    }
    
    return {
        isValid: warnings.length === 0,
        warnings
    };
};

/**
 * Validates parent-child age differences
 * @param {Object} parent - The parent person object
 * @param {Object} child - The child person object
 * @returns {Object} - Object with isValid property and any warnings
 */
exports.validateParentChildAgeDifference = (parent, child) => {
    const warnings = [];
    
    if (!parent || !child) {
        return { isValid: false, warnings: ['Invalid person data'] };
    }
    
    const parentBirthDate = parent.birth_date ? new Date(parent.birth_date) : null;
    const childBirthDate = child.birth_date ? new Date(child.birth_date) : null;
    
    if (parentBirthDate && childBirthDate) {
        // Parent should be born before child
        if (parentBirthDate >= childBirthDate) {
            warnings.push('Parent must be born before child');
        } else {
            const ageDifference = (childBirthDate - parentBirthDate) / (1000 * 60 * 60 * 24 * 365.25);
            
            // Check if parent was too young (under 12 years old)
            if (ageDifference < 12) {
                warnings.push(`Parent-child age difference (${Math.round(ageDifference)} years) is unusually small. Parent would have been under 12 years old.`);
            }
            
            // Check if parent was too old (over 70 years old)
            if (ageDifference > 70) {
                warnings.push(`Parent-child age difference (${Math.round(ageDifference)} years) is unusually large. Parent would have been over 70 years old.`);
            }
            
            // Flag borderline cases (12-14 years old)
            if (ageDifference >= 12 && ageDifference < 14) {
                warnings.push(`Parent-child age difference (${Math.round(ageDifference)} years) is unusually small. Please verify dates.`);
            }
            
            // Flag borderline cases (60-70 years old)
            if (ageDifference > 60 && ageDifference <= 70) {
                warnings.push(`Parent-child age difference (${Math.round(ageDifference)} years) is unusually large. Please verify dates.`);
            }
        }
    }
    
    return {
        isValid: warnings.length === 0,
        warnings
    };
};

/**
 * Validates sibling relationships
 * @param {Array} siblings - Array of person objects who are siblings
 * @returns {Object} - Object with isValid property and any warnings
 */
exports.validateSiblingRelationships = (siblings) => {
    const warnings = [];
    
    if (!siblings || !Array.isArray(siblings) || siblings.length < 2) {
        return { isValid: false, warnings: ['Invalid sibling data'] };
    }
    
    // Sort siblings by birth date (if available)
    const sortedSiblings = [...siblings].sort((a, b) => {
        if (!a.birth_date) return 1;
        if (!b.birth_date) return -1;
        return new Date(a.birth_date) - new Date(b.birth_date);
    });
    
    // Check age differences between consecutive siblings
    for (let i = 0; i < sortedSiblings.length - 1; i++) {
        const currentSibling = sortedSiblings[i];
        const nextSibling = sortedSiblings[i + 1];
        
        if (currentSibling.birth_date && nextSibling.birth_date) {
            const birthDate1 = new Date(currentSibling.birth_date);
            const birthDate2 = new Date(nextSibling.birth_date);
            
            const ageDifference = (birthDate2 - birthDate1) / (1000 * 60 * 60 * 24);
            
            // Flag twins or very close births (less than 9 months apart)
            if (ageDifference < 270 && ageDifference > 0) {
                warnings.push(`Siblings ${currentSibling.first_name} and ${nextSibling.first_name} were born less than 9 months apart (${Math.round(ageDifference)} days). Please verify dates.`);
            }
            
            // Flag unusually large age differences (more than 25 years)
            if (ageDifference > 9125) { // 25 years in days
                warnings.push(`Siblings ${currentSibling.first_name} and ${nextSibling.first_name} have an unusually large age difference (${Math.round(ageDifference / 365.25)} years). Please verify relationship.`);
            }
        }
    }
    
    // Check for siblings born on the same day (potential twins)
    for (let i = 0; i < siblings.length; i++) {
        for (let j = i + 1; j < siblings.length; j++) {
            const sibling1 = siblings[i];
            const sibling2 = siblings[j];
            
            if (sibling1.birth_date && sibling2.birth_date) {
                const birthDate1 = new Date(sibling1.birth_date).toISOString().split('T')[0];
                const birthDate2 = new Date(sibling2.birth_date).toISOString().split('T')[0];
                
                if (birthDate1 === birthDate2) {
                    warnings.push(`Siblings ${sibling1.first_name} and ${sibling2.first_name} were born on the same day. They might be twins.`);
                }
            }
        }
    }
    
    return {
        isValid: warnings.length === 0,
        warnings
    };
};

/**
 * Validates marriage data
 * @param {Object} person1 - First spouse
 * @param {Object} person2 - Second spouse
 * @param {Object} relationship - The marriage relationship object
 * @returns {Object} - Object with isValid property and any warnings
 */
exports.validateMarriage = (person1, person2, relationship) => {
    const warnings = [];
    
    if (!person1 || !person2 || !relationship) {
        return { isValid: false, warnings: ['Invalid marriage data'] };
    }
    
    const person1BirthDate = person1.birth_date ? new Date(person1.birth_date) : null;
    const person2BirthDate = person2.birth_date ? new Date(person2.birth_date) : null;
    const person1DeathDate = person1.death_date ? new Date(person1.death_date) : null;
    const person2DeathDate = person2.death_date ? new Date(person2.death_date) : null;
    const marriageDate = relationship.start_date ? new Date(relationship.start_date) : null;
    const divorceDate = relationship.end_date ? new Date(relationship.end_date) : null;
    
    if (marriageDate) {
        // Check if marriage date is in the future
        if (marriageDate > new Date()) {
            warnings.push('Marriage date is in the future');
        }
        
        // Check if marriage date is before either spouse's birth date
        if (person1BirthDate && marriageDate < person1BirthDate) {
            warnings.push(`Marriage date is before ${person1.first_name}'s birth date`);
        }
        
        if (person2BirthDate && marriageDate < person2BirthDate) {
            warnings.push(`Marriage date is before ${person2.first_name}'s birth date`);
        }
        
        // Check if marriage date is after either spouse's death date
        if (person1DeathDate && marriageDate > person1DeathDate) {
            warnings.push(`Marriage date is after ${person1.first_name}'s death date`);
        }
        
        if (person2DeathDate && marriageDate > person2DeathDate) {
            warnings.push(`Marriage date is after ${person2.first_name}'s death date`);
        }
        
        // Check age at marriage
        if (person1BirthDate) {
            const ageAtMarriage = (marriageDate - person1BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
            
            if (ageAtMarriage < 14) {
                warnings.push(`${person1.first_name}'s age at marriage (${Math.round(ageAtMarriage)} years) is unusually young`);
            }
        }
        
        if (person2BirthDate) {
            const ageAtMarriage = (marriageDate - person2BirthDate) / (1000 * 60 * 60 * 24 * 365.25);
            
            if (ageAtMarriage < 14) {
                warnings.push(`${person2.first_name}'s age at marriage (${Math.round(ageAtMarriage)} years) is unusually young`);
            }
        }
    }
    
    if (divorceDate) {
        // Check if divorce date is in the future
        if (divorceDate > new Date()) {
            warnings.push('Divorce date is in the future');
        }
        
        // Check if divorce date is before marriage date
        if (marriageDate && divorceDate < marriageDate) {
            warnings.push('Divorce date is before marriage date');
        }
        
        // Check if divorce date is after either spouse's death date
        if (person1DeathDate && divorceDate > person1DeathDate) {
            warnings.push(`Divorce date is after ${person1.first_name}'s death date`);
        }
        
        if (person2DeathDate && divorceDate > person2DeathDate) {
            warnings.push(`Divorce date is after ${person2.first_name}'s death date`);
        }
    }
    
    return {
        isValid: warnings.length === 0,
        warnings
    };
};

/**
 * Validates historical consistency of dates
 * @param {Date} date - The date to validate
 * @param {string} eventType - The type of event
 * @param {string} location - The location of the event
 * @returns {Object} - Object with isValid property and any warnings
 */
exports.validateHistoricalConsistency = (date, eventType, location) => {
    const warnings = [];
    
    if (!date) {
        return { isValid: true, warnings: [] };
    }
    
    const eventDate = new Date(date);
    const currentYear = new Date().getFullYear();
    const eventYear = eventDate.getFullYear();
    
    // Check if date is in the future
    if (eventDate > new Date()) {
        warnings.push('Date is in the future');
    }
    
    // Check if date is unreasonably old (before 1400)
    if (eventYear < 1400) {
        warnings.push(`Date (${eventYear}) is before 1400. Reliable genealogical records are rare before this period.`);
    }
    
    // Check specific event types against historical context
    if (eventType === 'census' && location && location.toLowerCase().includes('united states')) {
        // US Census years
        const usCensusYears = [
            1790, 1800, 1810, 1820, 1830, 1840, 1850, 1860, 1870, 1880, 1890, 
            1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 
            2010, 2020
        ];
        
        // Check if the year is a valid US Census year
        if (!usCensusYears.includes(eventYear)) {
            warnings.push(`${eventYear} is not a US Census year. US Census was conducted in: ${usCensusYears.join(', ')}`);
        }
    }
    
    // Check for events during major historical periods
    if (eventType === 'military_service') {
        // Major US wars
        const usWars = [
            { name: 'American Revolution', start: 1775, end: 1783 },
            { name: 'War of 1812', start: 1812, end: 1815 },
            { name: 'Mexican-American War', start: 1846, end: 1848 },
            { name: 'American Civil War', start: 1861, end: 1865 },
            { name: 'Spanish-American War', start: 1898, end: 1898 },
            { name: 'World War I', start: 1917, end: 1918 },
            { name: 'World War II', start: 1941, end: 1945 },
            { name: 'Korean War', start: 1950, end: 1953 },
            { name: 'Vietnam War', start: 1955, end: 1975 },
            { name: 'Gulf War', start: 1990, end: 1991 },
            { name: 'War in Afghanistan', start: 2001, end: 2021 },
            { name: 'Iraq War', start: 2003, end: 2011 }
        ];
        
        // Find wars that overlap with the event date
        const overlappingWars = usWars.filter(war => 
            eventYear >= war.start && eventYear <= war.end
        );
        
        if (overlappingWars.length > 0) {
            warnings.push(`Military service in ${eventYear} coincides with: ${overlappingWars.map(w => w.name).join(', ')}`);
        }
    }
    
    // Check for immigration events against historical context
    if (eventType === 'immigration' && location) {
        // Major US immigration waves
        const immigrationWaves = [
            { period: 'Colonial Period', start: 1607, end: 1775, groups: ['British', 'German', 'Dutch', 'French'] },
            { period: 'Old Immigration', start: 1820, end: 1880, groups: ['German', 'Irish', 'British'] },
            { period: 'New Immigration', start: 1880, end: 1920, groups: ['Italian', 'Polish', 'Russian', 'Jewish', 'Greek'] },
            { period: 'Post-WWII', start: 1945, end: 1965, groups: ['European'] },
            { period: 'Modern Immigration', start: 1965, end: currentYear, groups: ['Asian', 'Latin American'] }
        ];
        
        // Find immigration waves that overlap with the event date
        const overlappingWaves = immigrationWaves.filter(wave => 
            eventYear >= wave.start && eventYear <= wave.end
        );
        
        if (overlappingWaves.length > 0) {
            warnings.push(`Immigration in ${eventYear} falls within: ${overlappingWaves.map(w => w.period).join(', ')}`);
        }
    }
    
    return {
        isValid: warnings.length === 0,
        warnings
    };
};
