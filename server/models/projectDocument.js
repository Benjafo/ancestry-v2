const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectDocument = sequelize.define('ProjectDocument', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING
    },
    file_path: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = ProjectDocument;
