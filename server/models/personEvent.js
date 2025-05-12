const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PersonEvent = sequelize.define('PersonEvent', {
    person_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'persons',
            key: 'person_id'
        },
        validate: {
            isUUID: {
                args: 4,
                msg: 'Person ID must be a valid UUID'
            }
        }
    },
    event_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'events',
            key: 'event_id'
        },
        validate: {
            isUUID: {
                args: 4,
                msg: 'Event ID must be a valid UUID'
            }
        }
    },
    role: {
        type: DataTypes.STRING(50),
        validate: {
            isIn: {
                args: [['primary', 'witness', 'mentioned', null, '']],
                msg: 'Role must be one of: primary, witness, mentioned'
            }
        }
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'person_events',
    hooks: {
        beforeValidate: (personEvent) => {
            // Normalize role to lowercase
            if (personEvent.role) {
                personEvent.role = personEvent.role.toLowerCase();
            }
        },
        beforeCreate: async (personEvent, options) => {
            // Additional validation could be added here if needed
            // For example, validating that the event date is consistent with the person's birth/death dates
            if (options.transaction && personEvent.person_id && personEvent.event_id) {
                try {
                    const Person = require('./person');
                    const Event = require('./event');
                    
                    const [person, event] = await Promise.all([
                        Person.findByPk(personEvent.person_id, { transaction: options.transaction }),
                        Event.findByPk(personEvent.event_id, { transaction: options.transaction })
                    ]);
                    
                    if (person && event && event.event_date) {
                        // Validate event date against person's birth date
                        if (person.birth_date) {
                            const birthDate = new Date(person.birth_date);
                            const eventDate = new Date(event.event_date);
                            
                            // Events other than birth should be after birth date
                            if (event.event_type !== 'birth' && eventDate < birthDate) {
                                throw new Error(`Event date cannot be before person's birth date`);
                            }
                        }
                        
                        // Validate event date against person's death date
                        if (person.death_date) {
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
                    // Ignore other errors, as they might be related to circular dependencies
                }
            }
        }
    }
});

module.exports = PersonEvent;
