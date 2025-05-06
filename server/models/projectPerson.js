const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectPerson = sequelize.define('ProjectPerson', {
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
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'project_persons'
});

module.exports = ProjectPerson;
