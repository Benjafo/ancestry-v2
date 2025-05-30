const documentService = require('../services/documentService');
const UserEventService = require('../services/userEventService');
const { Project, ProjectUser } = require('../models');
const ProjectUtils = require('../utils/projectUtils');
const path = require('path');
const fs = require('fs');

/**
 * Document Controller
 * Handles HTTP requests for Document entities
 */

/**
 * Get all documents with pagination, filtering, and search
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocuments = async (req, res) => {
    try {
        const result = await documentService.getDocuments(req.query);
        res.json(result);
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            message: 'Server error retrieving documents',
            error: error.message
        });
    }
};

/**
 * Get a document by ID with optional related data
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentById = async (req, res) => {
    try {
        const { documentId } = req.params;
        const options = {
            includePersons: req.query.includePersons === 'true'
        };

        const document = await documentService.getDocumentById(documentId, options);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            message: 'Server error retrieving document',
            error: error.message
        });
    }
};

/**
 * Create a new document
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createDocument = async (req, res) => {
    try {
        const document = await documentService.createDocument(req.body);

        // Create user events for document creation for all associated projects
        const projectIds = await ProjectUtils.getProjectIdsForEntity('document', document.document_id);
        if (projectIds.length > 0) {
            await UserEventService.createEventForProjectUsers(
                projectIds, // Pass the array
                req.user.user_id,
                'document_created',
                `New document "${document.title}" added to project`,
                document.document_id, // entity_id is the document's ID
                'document' // entity_type is 'document'
            );
        }

        res.status(201).json({
            message: 'Document created successfully',
            document
        });
    } catch (error) {
        console.error('Create document error:', error);

        // Handle validation errors
        if (error.message.includes('Invalid file extension') ||
            error.message.includes('not found')) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error creating document',
            error: error.message
        });
    }
};

/**
 * Update a document
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await documentService.updateDocument(documentId, req.body);

        // Create user events for document update for all associated projects
        const projectIds = await ProjectUtils.getProjectIdsForEntity('document', documentId);
        if (projectIds.length > 0) {
            await UserEventService.createEventForProjectUsers(
                projectIds, // Pass the array
                req.user.user_id,
                'document_updated',
                `Document "${document.title}" updated in project`,
                document.document_id, // entity_id is the document's ID
                'document' // entity_type is 'document'
            );
        }
        console.log('Updated Document:', document);

        res.json({
            message: 'Document updated successfully',
            document
        });
    } catch (error) {
        console.error('Update document error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        // Handle validation errors
        if (error.message.includes('Invalid file extension')) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error updating document',
            error: error.message
        });
    }
};

/**
 * Delete a document
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        // Get document info before deleting it
        const document = await documentService.getDocumentById(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Store document info for events
        const documentTitle = document.title;

        // Get project IDs before deleting the document, as associations will be removed
        const projectIds = await ProjectUtils.getProjectIdsForEntity('document', documentId);

        // Delete the document
        await documentService.deleteDocument(documentId);

        // Create user events for document deletion for all associated projects
        if (projectIds.length > 0) {
            await UserEventService.createEventForProjectUsers(
                projectIds, // Pass the array
                req.user.user_id,
                'document_deleted',
                `Document "${documentTitle}" removed from project`,
                documentId, // entity_id is the document's ID
                'document' // entity_type is 'document'
            );
        }

        res.json({
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Delete document error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error deleting document',
            error: error.message
        });
    }
};

/**
 * Get documents by person ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentsByPersonId = async (req, res) => {
    try {
        const { personId } = req.params;
        const documents = await documentService.getDocumentsByPersonId(personId);

        res.json(documents);
    } catch (error) {
        console.error('Get documents by person error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error retrieving documents',
            error: error.message
        });
    }
};

/**
 * Get documents by type
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const documents = await documentService.getDocumentsByType(type);

        res.json(documents);
    } catch (error) {
        console.error('Get documents by type error:', error);
        res.status(500).json({
            message: 'Server error retrieving documents',
            error: error.message
        });
    }
};

/**
 * Get documents by date range
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, dateField } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Start date and end date are required'
            });
        }

        const documents = await documentService.getDocumentsByDateRange(
            new Date(startDate),
            new Date(endDate),
            dateField || 'upload_date'
        );

        res.json(documents);
    } catch (error) {
        console.error('Get documents by date range error:', error);
        res.status(500).json({
            message: 'Server error retrieving documents',
            error: error.message
        });
    }
};

/**
 * Get documents by project ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProjectDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortBy, sortOrder, includePersons } = req.query;

        const options = {
            includePersons: includePersons === 'true',
            sortBy,
            sortOrder
        };

        const documents = await documentService.getDocumentsByProjectId(id, options);

        res.json(documents);
    } catch (error) {
        console.error('Get project documents error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error retrieving project documents',
            error: error.message
        });
    }
};

/**
 * Associate a document with a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.associateDocumentWithPerson = async (req, res) => {
    console.log('Associate Document with Person Request Body:', req.body);
    try {
        const { documentId, personId } = req.body;

        if (!documentId || !personId) {
            return res.status(400).json({
                message: 'Document ID and Person ID are required'
            });
        }

        const association = await documentService.associateDocumentWithPerson(
            documentId,
            personId,
            {
                relevance: req.body.relevance,
                notes: req.body.notes
            }
        );

        // Get document and person info for events
        const docForEvent = await documentService.getDocumentById(documentId);
        const { Person } = require('../models');
        const personForEvent = await Person.findByPk(personId);

        if (docForEvent && personForEvent) {
            const projectIds = await ProjectUtils.getProjectIdsForEntity('document', documentId);
            if (projectIds.length > 0) {
                await UserEventService.createEventForProjectUsers(
                    projectIds, // Pass the array
                    req.user.user_id,
                    'document_associated',
                    `Document "${docForEvent.title}" associated with ${personForEvent.first_name} ${personForEvent.last_name} in project`,
                    documentId, // entity_id is the document's ID
                    'document' // entity_type is 'document'
                );
            }
        }


        res.status(201).json({
            message: 'Document associated with person successfully',
            association
        });
    } catch (error) {
        console.error('Associate document with person error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.message.includes('already associated') ||
            error.message.includes('validation failed')) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error associating document with person',
            error: error.message
        });
    }
};

/**
 * Update document-person association
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateDocumentPersonAssociation = async (req, res) => {
    try {
        const { documentId, personId } = req.params;

        const association = await documentService.updateDocumentPersonAssociation(
            documentId,
            personId,
            {
                relevance: req.body.relevance,
                notes: req.body.notes
            }
        );

        // Get document and person info for events
        const document = await documentService.getDocumentById(documentId);
        const { Person } = require('../models');
        const person = await Person.findByPk(personId);

        // if (document && person) {
        //     // Create event for the actor
        //     await UserEventService.createEvent(
        //         req.user.user_id,
        //         req.user.user_id,
        //         'document_person_association_updated',
        //         `Updated association between document "${document.title}" and person: ${person.first_name} ${person.last_name}`,
        //         documentId,
        //         'document'
        //     );

        //     // Create events for all project users if document is associated with a project
        //     if (document.project_id) {
        //         await UserEventService.createEventForProjectUsers(
        //             document.project_id,
        //             req.user.user_id,
        //             'document_person_association_updated',
        //             `Association between document "${document.title}" and ${person.first_name} ${person.last_name} has been updated`,
        //             documentId,
        //             'document'
        //         );
        //     }
        // }

        res.json({
            message: 'Document-person association updated successfully',
            association
        });
    } catch (error) {
        console.error('Update document-person association error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error updating document-person association',
            error: error.message
        });
    }
};

/**
 * Remove document-person association
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeDocumentPersonAssociation = async (req, res) => {
    try {
        const { documentId, personId } = req.params;

        // Get document and person details before removing the association
        const docForEvent = await documentService.getDocumentById(documentId);
        const { Person } = require('../models');
        const personForEvent = await Person.findByPk(personId);

        if (!docForEvent || !personForEvent) {
            return res.status(404).json({
                message: 'Document or person not found'
            });
        }

        // Get project IDs before removing the association, as associations will be removed
        const projectIds = await ProjectUtils.getProjectIdsForEntity('document', documentId);

        // Remove the association
        await documentService.removeDocumentPersonAssociation(documentId, personId);

        // Create user events for document-person association removal for all associated projects
        if (projectIds.length > 0) {
            await UserEventService.createEventForProjectUsers(
                projectIds, // Pass the array
                req.user.user_id,
                'document_removed',
                `Document "${docForEvent.title}" unassociated from ${personForEvent.first_name} ${personForEvent.last_name} in project`,
                documentId, // entity_id is the document's ID
                'document' // entity_type is 'document'
            );
        }

        res.json({
            message: 'Document-person association removed successfully'
        });
    } catch (error) {
        console.error('Remove document-person association error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error removing document-person association',
            error: error.message
        });
    }
};

/**
 * Get document-person association
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentPersonAssociation = async (req, res) => {
    try {
        const { documentId, personId } = req.params;

        const association = await documentService.getDocumentPersonAssociation(documentId, personId);

        if (!association) {
            return res.status(404).json({
                message: 'Document-person association not found'
            });
        }

        res.json(association);
    } catch (error) {
        console.error('Get document-person association error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: 'Server error retrieving document-person association',
            error: error.message
        });
    }
};

/**
 * Get document file for viewing or downloading
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDocumentFile = async (req, res) => {
    try {
        const { documentId } = req.params;

        // Get document details from database
        const document = await documentService.getDocumentById(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Construct file path
        const filePath = path.join(uploadsDir, document.file_path);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        // Set content type
        const contentType = document.mime_type || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);

        // Set content disposition based on query parameter
        if (req.query.download === 'true') {
            // For downloading
            res.setHeader('Content-Disposition', `attachment; filename="${path.basename(document.file_path)}"`);
        } else {
            // For viewing in browser
            res.setHeader('Content-Disposition', 'inline');
        }

        // Send the file
        res.sendFile(filePath);
    } catch (error) {
        console.error('Get document file error:', error);
        res.status(500).json({
            message: 'Server error retrieving document file',
            error: error.message
        });
    }
};

/**
 * Upload a document file
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadDocumentFile = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get file details from multer
        const { filename, originalname, mimetype, size, path: filePath } = req.file;

        // Extract relative path from absolute path
        const relativePath = filename;

        // Return file details to client
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                originalname,
                filename,
                mimetype,
                size,
                path: relativePath
            }
        });
    } catch (error) {
        console.error('Upload document file error:', error);
        res.status(500).json({
            message: 'Server error uploading document file',
            error: error.message
        });
    }
};
