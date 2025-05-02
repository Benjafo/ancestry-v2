const { body, param } = require('express-validator');
const { errorMessages } = require('../middleware/validation');

/**
 * Validation rules for creating a new event
 */
exports.createEventValidation = [
    body('person_id')
        .notEmpty().withMessage(errorMessages.required('Person ID'))
        .isUUID().withMessage('Person ID must be a valid UUID'),
    
    body('event_type')
        .notEmpty().withMessage(errorMessages.required('Event type'))
        .isString().withMessage('Event type must be a string')
        .isIn(['birth', 'death', 'marriage', 'divorce', 'immigration', 'emigration', 'naturalization', 'graduation', 'military_service', 'retirement', 'religious', 'medical', 'residence', 'census', 'other'])
        .withMessage('Invalid event type'),
    
    body('event_date')
        .optional()
        .isISO8601().withMessage('Event date must be a valid date in ISO 8601 format')
        .custom((value) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Event date cannot be in the future');
            }
            return true;
        }),
    
    body('event_location')
        .optional()
        .isString().withMessage('Event location must be a string')
        .isLength({ max: 255 }).withMessage('Event location cannot exceed 255 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    
    // Custom validation for specific event types
    body()
        .custom((value) => {
            // Birth and death events should have dates
            if (['birth', 'death'].includes(value.event_type) && !value.event_date) {
                throw new Error(`Date is required for ${value.event_type} events`);
            }
            
            // Marriage and divorce events should have locations
            if (['marriage', 'divorce'].includes(value.event_type) && !value.event_location) {
                throw new Error(`Location is recommended for ${value.event_type} events`);
            }
            
            return true;
        })
];

/**
 * Validation rules for updating an event
 */
exports.updateEventValidation = [
    param('eventId')
        .isUUID().withMessage(errorMessages.uuid),
    
    body('event_type')
        .optional()
        .isString().withMessage('Event type must be a string')
        .isIn(['birth', 'death', 'marriage', 'divorce', 'immigration', 'emigration', 'naturalization', 'graduation', 'military_service', 'retirement', 'religious', 'medical', 'residence', 'census', 'other'])
        .withMessage('Invalid event type'),
    
    body('event_date')
        .optional()
        .isISO8601().withMessage('Event date must be a valid date in ISO 8601 format')
        .custom((value) => {
            if (value && new Date(value) > new Date()) {
                throw new Error('Event date cannot be in the future');
            }
            return true;
        }),
    
    body('event_location')
        .optional()
        .isString().withMessage('Event location must be a string')
        .isLength({ max: 255 }).withMessage('Event location cannot exceed 255 characters'),
    
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
];

/**
 * Validation for event ID parameter
 */
exports.eventIdValidation = [
    param('eventId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for getting events by person ID
 */
exports.getEventsByPersonValidation = [
    param('personId')
        .isUUID().withMessage(errorMessages.uuid)
];

/**
 * Validation for chronological consistency of events
 * This is a more complex validation that would be used in a controller
 * after fetching the person's data from the database
 */
exports.validateEventChronology = (event, person) => {
    if (!event.event_date || !person) return true;
    
    const eventDate = new Date(event.event_date);
    
    // Validate against person's birth date
    if (person.birth_date) {
        const birthDate = new Date(person.birth_date);
        
        // Events other than birth should be after birth date
        if (event.event_type !== 'birth' && eventDate < birthDate) {
            throw new Error(`Event date cannot be before person's birth date`);
        }
        
        // Birth event should match the person's birth date
        if (event.event_type === 'birth' && 
            eventDate.toISOString().split('T')[0] !== birthDate.toISOString().split('T')[0]) {
            throw new Error(`Birth event date should match person's birth date`);
        }
    }
    
    // Validate against person's death date
    if (person.death_date) {
        const deathDate = new Date(person.death_date);
        
        // Events other than death should be before death date
        if (event.event_type !== 'death' && eventDate > deathDate) {
            throw new Error(`Event date cannot be after person's death date`);
        }
        
        // Death event should match the person's death date
        if (event.event_type === 'death' && 
            eventDate.toISOString().split('T')[0] !== deathDate.toISOString().split('T')[0]) {
            throw new Error(`Death event date should match person's death date`);
        }
    }
    
    return true;
};
