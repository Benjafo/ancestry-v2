const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
    event_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'persons',
            key: 'person_id'
        },
        validate: {
            notNull: {
                msg: 'Person ID is required'
            },
            isUUID: {
                args: 4,
                msg: 'Person ID must be a valid UUID'
            }
        }
    },
    event_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Event type is required'
            },
            isIn: {
                args: [['birth', 'death', 'marriage', 'divorce', 'immigration', 'emigration', 'naturalization', 'graduation', 'military_service', 'retirement', 'religious', 'medical', 'residence', 'census', 'other']],
                msg: 'Invalid event type'
            }
        }
    },
    event_date: {
        type: DataTypes.DATE,
        validate: {
            isDate: {
                msg: 'Event date must be a valid date'
            },
            customDateValidation(value) {
                // Check if event date is in the future
                if (value && new Date(value) > new Date()) {
                    throw new Error('Event date cannot be in the future');
                }
            }
        }
    },
    event_location: {
        type: DataTypes.STRING(255)
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'events',
    hooks: {
        beforeValidate: (event) => {
            // Normalize event type to lowercase
            if (event.event_type) {
                event.event_type = event.event_type.toLowerCase();
            }
            
            // Trim whitespace from location
            if (event.event_location) {
                event.event_location = event.event_location.trim();
            }
        },
        beforeCreate: async (event, options) => {
            // Additional validation for specific event types
            if (['birth', 'death'].includes(event.event_type) && !event.event_date) {
                throw new Error(`Date is required for ${event.event_type} events`);
            }
            
            // If transaction is provided in options, we can use it to fetch the person
            // and validate event date against person's birth/death dates
            if (options.transaction && event.person_id) {
                try {
                    const Person = require('./person');
                    const person = await Person.findByPk(event.person_id, { 
                        transaction: options.transaction 
                    });
                    
                    if (person) {
                        // Validate event date against person's birth date
                        if (person.birth_date && event.event_date) {
                            const birthDate = new Date(person.birth_date);
                            const eventDate = new Date(event.event_date);
                            
                            // Events other than birth should be after birth date
                            if (event.event_type !== 'birth' && eventDate < birthDate) {
                                throw new Error(`Event date cannot be before person's birth date`);
                            }
                        }
                        
                        // Validate event date against person's death date
                        if (person.death_date && event.event_date) {
                            const deathDate = new Date(person.death_date);
                            const eventDate = new Date(event.event_date);
                            
                            // Events other than death should be before death date
                            if (event.event_type !== 'death' && eventDate > deathDate) {
                                throw new Error(`Event date cannot be after person's death date`);
                            }
                        }
                    }
                } catch (error) {
                    if (error.message.includes('Event date cannot be')) {
                        throw error;
                    }
                    // Ignore other errors, as they might be related to the Person model not being loaded yet
                }
            }
        }
    },
    validate: {
        // Ensure event type and date are consistent
        eventConsistency() {
            // Birth and death events should have dates
            if (['birth', 'death'].includes(this.event_type) && !this.event_date) {
                throw new Error(`Date is required for ${this.event_type} events`);
            }
            
            // Marriage and divorce events should have locations
            if (['marriage', 'divorce'].includes(this.event_type) && !this.event_location) {
                throw new Error(`Location is recommended for ${this.event_type} events`);
            }
        }
    }
});

module.exports = Event;
