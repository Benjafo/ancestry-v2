const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserEvent = sequelize.define('UserEvent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    actor_id: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    event_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    entity_id: {
        type: DataTypes.UUID
    },
    entity_type: {
        type: DataTypes.STRING
    },
    project_ids: { // New field
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: true, // Can be null if event is not project-specific
        defaultValue: []
    }
}, {
    tableName: 'user_events',
    timestamps: true,
    underscored: true
});

module.exports = UserEvent;
