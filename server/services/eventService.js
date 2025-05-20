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
        const event = await eventRepository.findEventById(id, options);
        
        if (!event) {
            return null;
        }
        
        // If we need to include the person_id in the response
        if (!options.includePerson) {
            // Find the associated person_id from the PersonEvent junction table
            const PersonEvent = require('../models/personEvent');
            const personEvent = await PersonEvent.findOne({
                where: { event_id: id },
                attributes: ['person_id'],
                raw: true
            });
            
            if (personEvent) {
                // Add the person_id to the event object
                event.dataValues.person_id = personEvent.person_id;
            }
        }
        
        return event;
    }

    /**
     * Create a new event
     * 
     * @param {Object} eventData - Event data
     * @param {Object} transaction - Optional transaction object
     * @returns {Promise<Object>} Created event
     */
    async createEvent(eventData, transaction = null) {
        if (transaction) {
            return await this._executeCreateEvent(eventData, transaction);
        } else {
            return await TransactionManager.executeTransaction(async (t) => {
                return await this._executeCreateEvent(eventData, t);
            });
        }
    }
    
    /**
     * Helper method to execute event creation with a transaction
     * 
     * @param {Object} eventData - Event data
     * @param {Object} transaction - Transaction object
     * @returns {Promise<Object>} Created event
     * @private
     */
    async _executeCreateEvent(eventData, transaction) {
        // Extract person_id from eventData
        const { person_id, ...eventDataWithoutPersonId } = eventData;
        
        // Validate event data against person's birth/death dates
        if (person_id) {
            const person = await personRepository.findById(person_id, { transaction });
            
            if (!person) {
                throw new Error(`Person with id ${person_id} not found`);
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
        
        // Create the event (without person_id as it's not a field in the Event model)
        const event = await eventRepository.create(eventDataWithoutPersonId, { transaction });
        
        // Create the association in the PersonEvent junction table
        if (person_id) {
            const PersonEvent = require('../models/personEvent');
            await PersonEvent.create({
                person_id: person_id,
                event_id: event.event_id,
                role: 'primary' // Default role for the person associated with the event
            }, { transaction });
            
            // Add the person_id to the event object for the response
            event.dataValues.person_id = person_id;
        }
        
        return event;
    }

    /**
     * Update an event
     * 
     * @param {String} id - Event ID
     * @param {Object} eventData - Event data to update
     * @param {Object} transaction - Optional transaction object
     * @returns {Promise<Object>} Updated event
     */
    async updateEvent(id, eventData, transaction = null) {
        const executeUpdate = async (t) => {
            // Get the current event data
            const currentEvent = await eventRepository.findById(id, { transaction: t });
            if (!currentEvent) {
                throw new Error(`Event with id ${id} not found`);
            }
            
            // Extract person_id from eventData
            const { person_id, ...eventDataWithoutPersonId } = eventData;
            
            // Merge current data with updates (excluding person_id)
            const updatedData = {
                ...currentEvent.toJSON(),
                ...eventDataWithoutPersonId
            };
            
            // Get the PersonEvent model
            const PersonEvent = require('../models/personEvent');
            
            // Check if there's an existing association
            const existingAssociation = await PersonEvent.findOne({
                where: { event_id: id },
                transaction: t
            });
            
            // Validate event data against person's birth/death dates
            if (person_id) {
                const person = await personRepository.findById(person_id, { transaction: t });
                
                if (!person) {
                    throw new Error(`Person with id ${person_id} not found`);
                }
                
                // Validate event chronology
                try {
                    validateEventChronology({...updatedData, person_id}, person);
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
                
                // Update or create the person-event association
                if (existingAssociation) {
                    // Update the existing association if person_id has changed
                    if (existingAssociation.person_id !== person_id) {
                        await existingAssociation.update({
                            person_id: person_id
                        }, { transaction: t });
                    }
                } else {
                    // Create a new association if none exists
                    await PersonEvent.create({
                        person_id: person_id,
                        event_id: id,
                        role: 'primary' // Default role for the person associated with the event
                    }, { transaction: t });
                }
            }
            
            // Update the event (without person_id as it's not a field in the Event model)
            const event = await eventRepository.update(id, eventDataWithoutPersonId, { transaction: t });
            
            // Add the person_id to the event object for the response
            if (person_id) {
                event.dataValues.person_id = person_id;
            } else if (existingAssociation) {
                // If person_id wasn't provided in the update but there's an existing association,
                // include the existing person_id in the response
                event.dataValues.person_id = existingAssociation.person_id;
            }
            
            return event;
        };
        
        if (transaction) {
            return await executeUpdate(transaction);
        } else {
            return await TransactionManager.executeTransaction(executeUpdate);
        }
    }

    /**
     * Delete an event
     * 
     * @param {String} id - Event ID
     * @param {Object} transaction - Optional transaction object
     * @returns {Promise<Boolean>} True if successful
     */
    async deleteEvent(id, transaction = null) {
        const executeDelete = async (t) => {
            // Check if event exists
            const event = await eventRepository.findById(id, { transaction: t });
            if (!event) {
                throw new Error(`Event with id ${id} not found`);
            }
            
            // Delete the association in the PersonEvent junction table
            const PersonEvent = require('../models/personEvent');
            await PersonEvent.destroy({
                where: { event_id: id },
                transaction: t
            });
            
            // Delete the event
            return await eventRepository.delete(id, { transaction: t });
        };
        
        if (transaction) {
            return await executeDelete(transaction);
        } else {
            return await TransactionManager.executeTransaction(executeDelete);
        }
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
