const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ProjectUser model - represents the junction table between projects and users
 */
const ProjectUser = sequelize.define('project_users', {
    project_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'projects',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    access_level: {
        type: DataTypes.STRING(50),
        defaultValue: 'view',
        validate: {
            isIn: [['view', 'edit']]
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'project_users',
    timestamps: true,
    underscored: true
});

module.exports = ProjectUser;
