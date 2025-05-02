const { Person } = require('../models');
const { validatePersonEvents } = require('../utils/validationUtils');
const { validateAge, validateParentChildAgeDifference } = require('../utils/genealogyRules');

describe('Person Model Validation', () => {
    test('should validate birth date before death date', async () => {
        // Create a person with birth date after death date
        const person = Person.build({
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '2000-01-01',
            death_date: '1990-01-01'
        });

        // Validation should fail
        await expect(person.validate()).rejects.toThrow();
    });

    test('should validate birth date not in future', async () => {
        // Create a person with birth date in the future
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const person = Person.build({
            first_name: 'John',
            last_name: 'Doe',
            birth_date: futureDate
        });

        // Validation should fail
        await expect(person.validate()).rejects.toThrow();
    });

    test('should validate death date not in future', async () => {
        // Create a person with death date in the future
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const person = Person.build({
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1950-01-01',
            death_date: futureDate
        });

        // Validation should fail
        await expect(person.validate()).rejects.toThrow();
    });

    test('should validate gender values', async () => {
        // Create a person with invalid gender
        const person = Person.build({
            first_name: 'John',
            last_name: 'Doe',
            gender: 'invalid'
        });

        // Validation should fail
        await expect(person.validate()).rejects.toThrow();
    });

    test('should validate required fields', async () => {
        // Create a person without required fields
        const person = Person.build({
            middle_name: 'Middle'
        });

        // Validation should fail
        await expect(person.validate()).rejects.toThrow();
    });

    test('should normalize gender to lowercase', async () => {
        // Create a person with uppercase gender
        const person = Person.build({
            first_name: 'John',
            last_name: 'Doe',
            gender: 'MALE'
        });

        // Trigger beforeValidate hook
        await person.validate();

        // Gender should be normalized to lowercase
        expect(person.gender).toBe('male');
    });

    test('should trim whitespace from name fields', async () => {
        // Create a person with whitespace in name fields
        const person = Person.build({
            first_name: '  John  ',
            last_name: '  Doe  ',
            middle_name: '  Middle  ',
            maiden_name: '  Maiden  '
        });

        // Trigger beforeValidate hook
        await person.validate();

        // Name fields should be trimmed
        expect(person.first_name).toBe('John');
        expect(person.last_name).toBe('Doe');
        expect(person.middle_name).toBe('Middle');
        expect(person.maiden_name).toBe('Maiden');
    });

    test('should flag unusually high ages', async () => {
        // Create a person with unusually high age
        const person = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1850-01-01',
            death_date: '2000-01-01'
        };

        // Validate age
        const result = validateAge(person);

        // Validation should fail with warning
        expect(result.isValid).toBe(false);
        expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('exceeds 120 years')]));
    });
});

describe('Person Events Validation', () => {
    test('should validate events against person birth/death dates', () => {
        // Create a person
        const person = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1950-01-01',
            death_date: '2020-01-01'
        };

        // Create events
        const events = [
            {
                event_type: 'birth',
                event_date: '1950-01-01',
                event_location: 'New York'
            },
            {
                event_type: 'marriage',
                event_date: '1975-06-15',
                event_location: 'Boston'
            },
            {
                event_type: 'death',
                event_date: '2020-01-01',
                event_location: 'Chicago'
            }
        ];

        // Validate events
        const result = validatePersonEvents(person, events);

        // Validation should pass
        expect(result.isValid).toBe(true);
    });

    test('should detect events before birth', () => {
        // Create a person
        const person = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1950-01-01',
            death_date: '2020-01-01'
        };

        // Create events with one before birth
        const events = [
            {
                event_type: 'marriage',
                event_date: '1940-06-15', // Before birth
                event_location: 'Boston'
            }
        ];

        // Validate events
        const result = validatePersonEvents(person, events);

        // Validation should fail
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('before person\'s birth date')]));
    });

    test('should detect events after death', () => {
        // Create a person
        const person = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1950-01-01',
            death_date: '2020-01-01'
        };

        // Create events with one after death
        const events = [
            {
                event_type: 'residence',
                event_date: '2022-06-15', // After death
                event_location: 'Boston'
            }
        ];

        // Validate events
        const result = validatePersonEvents(person, events);

        // Validation should fail
        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('after person\'s death date')]));
    });
});

describe('Parent-Child Relationship Validation', () => {
    test('should validate reasonable parent-child age difference', () => {
        // Create parent and child
        const parent = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1950-01-01'
        };

        const child = {
            first_name: 'Jane',
            last_name: 'Doe',
            birth_date: '1980-01-01'
        };

        // Validate parent-child age difference
        const result = validateParentChildAgeDifference(parent, child);

        // Validation should pass
        expect(result.isValid).toBe(true);
    });

    test('should detect parent too young', () => {
        // Create parent and child with small age difference
        const parent = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1980-01-01'
        };

        const child = {
            first_name: 'Jane',
            last_name: 'Doe',
            birth_date: '1988-01-01' // Only 8 years difference
        };

        // Validate parent-child age difference
        const result = validateParentChildAgeDifference(parent, child);

        // Validation should fail
        expect(result.isValid).toBe(false);
        expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('unusually small')]));
    });

    test('should detect parent too old', () => {
        // Create parent and child with large age difference
        const parent = {
            first_name: 'John',
            last_name: 'Doe',
            birth_date: '1900-01-01'
        };

        const child = {
            first_name: 'Jane',
            last_name: 'Doe',
            birth_date: '1980-01-01' // 80 years difference
        };

        // Validate parent-child age difference
        const result = validateParentChildAgeDifference(parent, child);

        // Validation should fail
        expect(result.isValid).toBe(false);
        expect(result.warnings).toEqual(expect.arrayContaining([expect.stringContaining('unusually large')]));
    });
});
