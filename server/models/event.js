const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
    event_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
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
            
            // Note: Person validation is now handled through the person_events junction table
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
