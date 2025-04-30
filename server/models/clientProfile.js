const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClientProfile = sequelize.define('ClientProfile', {
    user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    phone: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    zip_code: {
        type: DataTypes.STRING
    },
    country: {
        type: DataTypes.STRING
    },
    email_notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    research_updates: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = ClientProfile;
