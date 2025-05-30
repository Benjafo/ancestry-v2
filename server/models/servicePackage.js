const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
    const ServicePackage = sequelize.define('ServicePackage', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price_cents: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'usd',
            validate: {
                isIn: [['usd']], // Only USD for now, can be expanded
            },
        },
        features: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: [],
            get() {
                const rawValue = this.getDataValue('features');
                return rawValue || [];
            },
            set(value) {
                this.setDataValue('features', value || []);
            },
        },
        estimated_delivery_weeks: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        sort_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'service_packages',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        scopes: {
            active: {
                where: {
                    is_active: true,
                },
                order: [['sort_order', 'ASC']],
            },
        },
    });

    return ServicePackage;
};
