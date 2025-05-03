const documentService = require('../services/documentService');

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
        await documentService.deleteDocument(documentId);
        
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
 * Associate a document with a person
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.associateDocumentWithPerson = async (req, res) => {
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
        
        await documentService.removeDocumentPersonAssociation(documentId, personId);
        
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
