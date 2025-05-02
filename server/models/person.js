const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Person = sequelize.define('Person', {
    person_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'First name cannot be empty'
            }
        }
    },
    middle_name: {
        type: DataTypes.STRING(100)
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Last name cannot be empty'
            }
        }
    },
    maiden_name: {
        type: DataTypes.STRING(100)
    },
    gender: {
        type: DataTypes.STRING(20),
        validate: {
            isIn: {
                args: [['male', 'female', 'other', 'unknown']],
                msg: 'Gender must be one of: male, female, other, unknown'
            }
        }
    },
    birth_date: {
        type: DataTypes.DATE,
        validate: {
            isDate: {
                msg: 'Birth date must be a valid date'
            },
            isBefore: function(value) {
                if (value && this.death_date && new Date(value) >= new Date(this.death_date)) {
                    throw new Error('Birth date must be before death date');
                }
                
                // Check if birth date is in the future
                if (value && new Date(value) > new Date()) {
                    throw new Error('Birth date cannot be in the future');
                }
            }
        }
    },
    birth_location: {
        type: DataTypes.STRING(255)
    },
    death_date: {
        type: DataTypes.DATE,
        validate: {
            isDate: {
                msg: 'Death date must be a valid date'
            },
            isAfter: function(value) {
                if (value && this.birth_date && new Date(value) <= new Date(this.birth_date)) {
                    throw new Error('Death date must be after birth date');
                }
                
                // Check if death date is in the future
                if (value && new Date(value) > new Date()) {
                    throw new Error('Death date cannot be in the future');
                }
            }
        }
    },
    death_location: {
        type: DataTypes.STRING(255)
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'persons',
    hooks: {
        beforeValidate: (person) => {
            // Normalize gender to lowercase
            if (person.gender) {
                person.gender = person.gender.toLowerCase();
            }
            
            // Trim whitespace from name fields
            if (person.first_name) person.first_name = person.first_name.trim();
            if (person.middle_name) person.middle_name = person.middle_name.trim();
            if (person.last_name) person.last_name = person.last_name.trim();
            if (person.maiden_name) person.maiden_name = person.maiden_name.trim();
        }
    },
    validate: {
        // Additional model-level validations
        ageCheck() {
            if (this.birth_date && this.death_date) {
                const birthYear = new Date(this.birth_date).getFullYear();
                const deathYear = new Date(this.death_date).getFullYear();
                const age = deathYear - birthYear;
                
                // Flag unusually high ages (over 120 years)
                if (age > 120) {
                    throw new Error('Age at death exceeds 120 years. Please verify dates.');
                }
            }
        }
    }
});

module.exports = Person;
