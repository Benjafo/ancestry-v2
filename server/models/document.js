const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const path = require('path');

const Document = sequelize.define('Document', {
    document_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Document title is required'
            },
            notEmpty: {
                msg: 'Document title cannot be empty'
            }
        }
    },
    document_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Document type is required'
            },
            isIn: {
                args: [['photo', 'certificate', 'letter', 'record', 'newspaper', 'census', 'military', 'legal', 'map', 'audio', 'video', 'other']],
                msg: 'Invalid document type'
            }
        }
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'File path is required'
            },
            notEmpty: {
                msg: 'File path cannot be empty'
            }
        }
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: {
                msg: 'Upload date must be a valid date'
            },
            isPastOrPresent(value) {
                if (value && new Date(value) > new Date()) {
                    throw new Error('Upload date cannot be in the future');
                }
            }
        }
    },
    file_size: {
        type: DataTypes.INTEGER,
        validate: {
            isInt: {
                msg: 'File size must be an integer'
            },
            min: {
                args: [0],
                msg: 'File size cannot be negative'
            }
        }
    },
    mime_type: {
        type: DataTypes.STRING(100),
        validate: {
            isValidMimeType(value) {
                if (value) {
                    // Basic MIME type validation
                    const validMimeTypes = [
                        // Images
                        'image/jpeg', 'image/png', 'image/gif', 'image/tiff',
                        // Documents
                        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain', 'text/html', 'text/csv',
                        // Audio
                        'audio/mpeg', 'audio/wav', 'audio/ogg',
                        // Video
                        'video/mp4', 'video/mpeg', 'video/quicktime',
                        // Archives
                        'application/zip', 'application/x-rar-compressed'
                    ];
                    
                    if (!validMimeTypes.includes(value)) {
                        throw new Error('Invalid MIME type');
                    }
                }
            }
        }
    },
    description: {
        type: DataTypes.TEXT
    },
    source: {
        type: DataTypes.STRING(255)
    },
    date_of_original: {
        type: DataTypes.DATE,
        validate: {
            isDate: {
                msg: 'Date of original must be a valid date'
            }
        }
    }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'documents',
    hooks: {
        beforeValidate: (document) => {
            // Normalize document type to lowercase
            if (document.document_type) {
                document.document_type = document.document_type.toLowerCase();
            }
            
            // Trim whitespace from title and source
            if (document.title) document.title = document.title.trim();
            if (document.source) document.source = document.source.trim();
            
            // Set upload date to current date if not provided
            if (!document.upload_date) {
                document.upload_date = new Date();
            }
        },
        beforeCreate: (document) => {
            // Validate file extension matches document type
            if (document.file_path) {
                const ext = path.extname(document.file_path).toLowerCase();
                
                // Define valid extensions for each document type
                const validExtensions = {
                    photo: ['.jpg', '.jpeg', '.png', '.gif', '.tiff'],
                    certificate: ['.pdf', '.jpg', '.jpeg', '.png'],
                    letter: ['.pdf', '.doc', '.docx', '.txt'],
                    record: ['.pdf', '.doc', '.docx', '.txt', '.csv'],
                    newspaper: ['.pdf', '.jpg', '.jpeg', '.png'],
                    census: ['.pdf', '.jpg', '.jpeg', '.png', '.csv'],
                    military: ['.pdf', '.jpg', '.jpeg', '.png'],
                    legal: ['.pdf', '.doc', '.docx', '.txt'],
                    map: ['.jpg', '.jpeg', '.png', '.pdf', '.tiff'],
                    audio: ['.mp3', '.wav', '.ogg'],
                    video: ['.mp4', '.avi', '.mov', '.wmv'],
                    other: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.zip', '.rar']
                };
                
                // Check if extension is valid for the document type
                if (validExtensions[document.document_type] && 
                    !validExtensions[document.document_type].includes(ext)) {
                    throw new Error(`Invalid file extension for document type '${document.document_type}'`);
                }
            }
        }
    },
    validate: {
        // Ensure document type and file path are consistent
        documentConsistency() {
            // Check if file path exists for document
            if (!this.file_path) {
                throw new Error('File path is required for all documents');
            }
        }
    }
});

module.exports = Document;
