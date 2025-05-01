const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Relationship = sequelize.define('Relationship', {
    relationship_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    person1_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'persons',
            key: 'person_id'
        },
        validate: {
            notNull: {
                msg: 'Person 1 ID is required'
            },
            isUUID: {
                args: 4,
                msg: 'Person 1 ID must be a valid UUID'
            }
        }
    },
    person2_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'persons',
            key: 'person_id'
        },
        validate: {
            notNull: {
                msg: 'Person 2 ID is required'
            },
            isUUID: {
                args: 4,
                msg: 'Person 2 ID must be a valid UUID'
            },
            notEqualToPerson1(value) {
                if (value === this.person1_id) {
                    throw new Error('Person 2 cannot be the same as Person 1');
                }
            }
        }
    },
    relationship_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Relationship type is required'
            },
            isIn: {
                args: [['parent', 'child', 'spouse', 'sibling', 'grandparent', 'grandchild', 'aunt/uncle', 'niece/nephew', 'cousin']],
                msg: 'Invalid relationship type'
            }
        }
    },
    relationship_qualifier: {
        type: DataTypes.STRING(50),
        validate: {
            isIn: {
                args: [['biological', 'adoptive', 'step', 'foster', 'in-law', null, '']],
                msg: 'Invalid relationship qualifier'
            }
        }
    },
    start_date: {
        type: DataTypes.DATE,
        validate: {
            isDate: {
                msg: 'Start date must be a valid date'
            },
            isBefore: function(value) {
                if (value && this.end_date && new Date(value) >= new Date(this.end_date)) {
                    throw new Error('Start date must be before end date');
                }
            }
        }
    },
    end_date: {
        type: DataTypes.DATE,
        validate: {
            isDate: {
                msg: 'End date must be a valid date'
            },
            isAfter: function(value) {
                if (value && this.start_date && new Date(value) <= new Date(this.start_date)) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'relationships',
    hooks: {
        beforeValidate: (relationship) => {
            // Normalize relationship type and qualifier to lowercase
            if (relationship.relationship_type) {
                relationship.relationship_type = relationship.relationship_type.toLowerCase();
            }
            if (relationship.relationship_qualifier) {
                relationship.relationship_qualifier = relationship.relationship_qualifier.toLowerCase();
            }
        },
        beforeCreate: async (relationship) => {
            // Additional validation for specific relationship types
            if (relationship.relationship_type === 'spouse' && !relationship.start_date) {
                throw new Error('Marriage date (start_date) is required for spouse relationships');
            }
        }
    },
    validate: {
        // Ensure relationship type and qualifier are compatible
        relationshipConsistency() {
            // For spouse relationships, certain qualifiers don't make sense
            if (this.relationship_type === 'spouse' && 
                ['biological', 'adoptive', 'foster'].includes(this.relationship_qualifier)) {
                throw new Error(`'${this.relationship_qualifier}' is not a valid qualifier for spouse relationships`);
            }
            
            // For parent/child relationships, 'in-law' doesn't make sense
            if (['parent', 'child'].includes(this.relationship_type) && 
                this.relationship_qualifier === 'in-law') {
                throw new Error(`'in-law' is not a valid qualifier for ${this.relationship_type} relationships`);
            }
        }
    }
});

module.exports = Relationship;
