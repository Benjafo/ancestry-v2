const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'on_hold'),
        defaultValue: 'active'
    },
    researcher_id: {
        type: DataTypes.UUID,
        references: {
            model: 'users',
            key: 'user_id'
        }
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Project;
