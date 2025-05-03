const eventRepository = require('../repositories/eventRepository');
const personRepository = require('../repositories/personRepository');
const TransactionManager = require('../utils/transactionManager');
const { validateEventChronology } = require('../validations/eventValidations');
const { validateHistoricalConsistency } = require('../utils/genealogyRules');

/**
 * Event Service
 * Handles business logic for Event entities
 */
class EventService {
    /**
     * Get events with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated result with events and metadata
     */
    async getEvents(params = {}) {
        return await eventRepository.findEvents(params);
    }

    /**
     * Get an event by ID with optional related data
     * 
     * @param {String} id - Event ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Event with related data
     */
    async getEventById(id, options = {}) {
        return await eventRepository.findEventById(id, options);
    }

    /**
     * Create a new event
     * 
     * @param {Object} eventData - Event data
     * @returns {Promise<Object>} Created event
     */
    async createEvent(eventData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Validate event data against person's birth/death dates
            if (eventData.person_id) {
                const person = await personRepository.findById(eventData.person_id, { transaction });
                
                if (!person) {
                    throw new Error(`Person with id ${eventData.person_id} not found`);
                }
                
                // Validate event chronology
                try {
                    validateEventChronology(eventData, person);
                } catch (error) {
                    throw new Error(`Event chronology validation failed: ${error.message}`);
                }
                
                // Validate historical consistency
                const historyValidation = validateHistoricalConsistency(
                    eventData.event_date,
                    eventData.event_type,
                    eventData.event_location
                );
                
                if (!historyValidation.isValid) {
                    throw new Error(`Historical consistency validation failed: ${historyValidation.warnings.join(', ')}`);
                }
            }
            
            // Create the event
            const event = await eventRepository.create(eventData, { transaction });
            
            return event;
        });
    }

    /**
     * Update an event
     * 
     * @param {String} id - Event ID
     * @param {Object} eventData - Event data to update
     * @returns {Promise<Object>} Updated event
     */
    async updateEvent(id, eventData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get the current event data
            const currentEvent = await eventRepository.findById(id, { transaction });
            if (!currentEvent) {
                throw new Error(`Event with id ${id} not found`);
            }
            
            // Merge current data with updates
            const updatedData = {
                ...currentEvent.toJSON(),
                ...eventData
            };
            
            // Validate event data against person's birth/death dates
            if (updatedData.person_id) {
                const person = await personRepository.findById(updatedData.person_id, { transaction });
                
                if (!person) {
                    throw new Error(`Person with id ${updatedData.person_id} not found`);
                }
                
                // Validate event chronology
                try {
                    validateEventChronology(updatedData, person);
                } catch (error) {
                    throw new Error(`Event chronology validation failed: ${error.message}`);
                }
                
                // Validate historical consistency
                const historyValidation = validateHistoricalConsistency(
                    updatedData.event_date,
                    updatedData.event_type,
                    updatedData.event_location
                );
                
                if (!historyValidation.isValid) {
                    throw new Error(`Historical consistency validation failed: ${historyValidation.warnings.join(', ')}`);
                }
            }
            
            // Update the event
            const event = await eventRepository.update(id, eventData, { transaction });
            
            return event;
        });
    }

    /**
     * Delete an event
     * 
     * @param {String} id - Event ID
     * @returns {Promise<Boolean>} True if successful
     */
    async deleteEvent(id) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if event exists
            const event = await eventRepository.findById(id, { transaction });
            if (!event) {
                throw new Error(`Event with id ${id} not found`);
            }
            
            // Delete the event
            return await eventRepository.delete(id, { transaction });
        });
    }

    /**
     * Get events by person ID
     * 
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async getEventsByPersonId(personId, options = {}) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        return await eventRepository.findEventsByPersonId(personId, options);
    }

    /**
     * Get events by type
     * 
     * @param {String} eventType - Event type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async getEventsByType(eventType, options = {}) {
        return await eventRepository.findEventsByType(eventType, options);
    }

    /**
     * Get events by date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async getEventsByDateRange(startDate, endDate, options = {}) {
        return await eventRepository.findEventsByDateRange(startDate, endDate, options);
    }

    /**
     * Get events by location
     * 
     * @param {String} location - Location to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async getEventsByLocation(location, options = {}) {
        return await eventRepository.findEventsByLocation(location, options);
    }

    /**
     * Get events by person and type
     * 
     * @param {String} personId - Person ID
     * @param {String} eventType - Event type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of events
     */
    async getEventsByPersonAndType(personId, eventType, options = {}) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        return await eventRepository.findEventsByPersonAndType(personId, eventType, options);
    }

    /**
     * Get timeline for a person
     * 
     * @param {String} personId - Person ID
     * @returns {Promise<Array>} Array of events sorted by date
     */
    async getPersonTimeline(personId) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        // Get all events for the person
        const events = await eventRepository.findEventsByPersonId(personId, {
            order: [['event_date', 'ASC']]
        });
        
        // Add birth and death events if they exist in person data but not in events
        const timeline = [...events];
        
        if (person.birth_date) {
            const birthEvent = events.find(e => e.event_type === 'birth');
            if (!birthEvent) {
                timeline.unshift({
                    event_type: 'birth',
                    event_date: person.birth_date,
                    event_location: person.birth_location,
                    description: `Birth of ${person.first_name} ${person.last_name}`,
                    person_id: personId,
                    isVirtual: true // Flag to indicate this is not a real event record
                });
            }
        }
        
        if (person.death_date) {
            const deathEvent = events.find(e => e.event_type === 'death');
            if (!deathEvent) {
                timeline.push({
                    event_type: 'death',
                    event_date: person.death_date,
                    event_location: person.death_location,
                    description: `Death of ${person.first_name} ${person.last_name}`,
                    person_id: personId,
                    isVirtual: true // Flag to indicate this is not a real event record
                });
            }
        }
        
        // Sort timeline by date
        return timeline.sort((a, b) => {
            if (!a.event_date) return -1;
            if (!b.event_date) return 1;
            return new Date(a.event_date) - new Date(b.event_date);
        });
    }
}

module.exports = new EventService();
