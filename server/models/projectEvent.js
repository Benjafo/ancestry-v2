const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectEvent = sequelize.define('ProjectEvent', {
    project_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'projects',
            key: 'id'
        },
        validate: {
            isUUID: {
                args: 4,
                msg: 'Project ID must be a valid UUID'
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
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'project_events',
    hooks: {
        beforeCreate: async (projectEvent, options) => {
            // Additional validation could be added here if needed
            // For example, validating that the event is relevant to the project
        }
    }
});

module.exports = ProjectEvent;
