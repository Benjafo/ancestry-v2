const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4(),
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'user_id',
            },
        },
        service_package_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'service_packages',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'succeeded', 'failed', 'refunded', 'processing', 'completed']],
            },
        },
        total_amount_cents: {
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
                isIn: [['usd']],
            },
        },
        stripe_payment_intent_id: {
            type: DataTypes.STRING(255),
            allowNull: true, // Can be null initially, set after intent creation
            unique: true,
        },
        customer_info: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            get() {
                const rawValue = this.getDataValue('customer_info');
                return rawValue || {};
            },
            set(value) {
                this.setDataValue('customer_info', value || {});
            },
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
        tableName: 'orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            // Example hook: Log status changes
            afterUpdate: (order, options) => {
                if (order.changed('status')) {
                    console.log(`Order ${order.id} status changed from ${order._previousDataValues.status} to ${order.status}`);
                    // Potentially trigger user event logging here
                }
            },
        },
    });

    return Order;
};
