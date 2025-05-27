const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DocumentPerson = sequelize.define('DocumentPerson', {
    document_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'documents',
            key: 'document_id'
        },
        validate: {
            isUUID: {
                args: 4,
                msg: 'Document ID must be a valid UUID'
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
    relevance: {
        type: DataTypes.STRING(50),
        validate: {
            isIn: {
                args: [['primary', 'secondary', 'mentioned', null, '']],
                msg: 'Relevance must be one of: primary, secondary, mentioned'
            }
        }
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'document_persons',
    hooks: {
        beforeValidate: (documentPerson) => {
            // Normalize relevance to lowercase
            if (documentPerson.relevance) {
                documentPerson.relevance = documentPerson.relevance.toLowerCase();
            }
        }
    },
    validate: {
        // Additional model-level validations can be added here
    }
});

module.exports = DocumentPerson;
