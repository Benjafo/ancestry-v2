const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../config/database');

const OrderProject = sequelize.define('OrderProject', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // Enforce one-to-one relationship
        references: {
            model: 'orders',
            key: 'id',
        },
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, // Enforce one-to-one relationship
        references: {
            model: 'projects',
            key: 'id',
        },
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'order_projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // No updated_at for this junction table
});

module.exports = OrderProject;