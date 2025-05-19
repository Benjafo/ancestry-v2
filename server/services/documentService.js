const documentRepository = require('../repositories/documentRepository');
const personRepository = require('../repositories/personRepository');
const TransactionManager = require('../utils/transactionManager');
const { validateDocumentPerson } = require('../utils/validationUtils');
const path = require('path');

/**
 * Document Service
 * Handles business logic for Document entities
 */
class DocumentService {
    /**
     * Get documents with pagination, filtering, and search
     * 
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Paginated result with documents and metadata
     */
    async getDocuments(params = {}) {
        return await documentRepository.findDocuments(params);
    }

    /**
     * Get a document by ID with optional related data
     * 
     * @param {String} id - Document ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Document with related data
     */
    async getDocumentById(id, options = {}) {
        return await documentRepository.findDocumentById(id, options);
    }

    /**
     * Create a new document
     * 
     * @param {Object} documentData - Document data
     * @returns {Promise<Object>} Created document
     */
    async createDocument(documentData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Validate file extension matches document type
            if (documentData.file_path && documentData.document_type) {
                const ext = path.extname(documentData.file_path).toLowerCase();
                
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
                if (validExtensions[documentData.document_type] && 
                    !validExtensions[documentData.document_type].includes(ext)) {
                    throw new Error(`Invalid file extension for document type '${documentData.document_type}'`);
                }
            }
            
            // Create the document
            const document = await documentRepository.create(documentData, { transaction });
            
            return document;
        });
    }

    /**
     * Update a document
     * 
     * @param {String} id - Document ID
     * @param {Object} documentData - Document data to update
     * @returns {Promise<Object>} Updated document
     */
    async updateDocument(id, documentData) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Get the current document data
            const currentDocument = await documentRepository.findById(id, { transaction });
            if (!currentDocument) {
                throw new Error(`Document with id ${id} not found`);
            }
            
            // Merge current data with updates
            const updatedData = {
                ...currentDocument.toJSON(),
                ...documentData
            };
            
            // Validate file extension matches document type if both are provided
            if (updatedData.file_path && updatedData.document_type) {
                const ext = path.extname(updatedData.file_path).toLowerCase();
                
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
                if (validExtensions[updatedData.document_type] && 
                    !validExtensions[updatedData.document_type].includes(ext)) {
                    throw new Error(`Invalid file extension for document type '${updatedData.document_type}'`);
                }
            }
            
            // Update the document
            const document = await documentRepository.update(id, documentData, { transaction });
            
            return document;
        });
    }

    /**
     * Delete a document
     * 
     * @param {String} id - Document ID
     * @returns {Promise<Boolean>} True if successful
     */
    async deleteDocument(id) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if document exists
            const document = await documentRepository.findById(id, { transaction });
            if (!document) {
                throw new Error(`Document with id ${id} not found`);
            }
            
            // Delete the document
            return await documentRepository.delete(id, { transaction });
        });
    }

    /**
     * Get documents by person ID
     * 
     * @param {String} personId - Person ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async getDocumentsByPersonId(personId, options = {}) {
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        return await documentRepository.findDocumentsByPersonId(personId, options);
    }

    /**
     * Get documents by type
     * 
     * @param {String} documentType - Document type
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async getDocumentsByType(documentType, options = {}) {
        return await documentRepository.findDocumentsByType(documentType, options);
    }

    /**
     * Get documents by date range
     * 
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {String} dateField - Date field to filter on (upload_date or date_of_original)
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async getDocumentsByDateRange(startDate, endDate, dateField = 'upload_date', options = {}) {
        return await documentRepository.findDocumentsByDateRange(startDate, endDate, dateField, options);
    }

    /**
     * Associate a document with a person
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @param {Object} data - Association data (relevance, notes)
     * @returns {Promise<Object>} Created association
     */
    async associateDocumentWithPerson(documentId, personId, data = {}) {
        console.log('Attempting to associate document', documentId, 'with person', personId);
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if document exists
            const document = await documentRepository.findById(documentId, { transaction });
            if (!document) {
                throw new Error(`Document with id ${documentId} not found`);
            }
            
            // Check if person exists
            const person = await personRepository.findById(personId, { transaction });
            if (!person) {
                throw new Error(`Person with id ${personId} not found`);
            }
            
            // Check if association already exists
            const existingAssociation = await documentRepository.getDocumentPersonAssociation(
                documentId, 
                personId,
                { transaction }
            );
            
            if (existingAssociation) {
                throw new Error('Document is already associated with this person');
            }
            
            // Validate document-person association
            const validationResult = validateDocumentPerson(document, person);
            if (!validationResult.isValid) {
                throw new Error(`Document-person validation failed: ${validationResult.errors.join(', ')}`);
            }
            
            // Create the association
            const association = await documentRepository.associateDocumentWithPerson(
                documentId, 
                personId, 
                data,
                { transaction }
            );
            
            console.log('Document-person association created successfully:', association.document_id, association.person_id);
            return association;
        });
    } catch (error) {
        console.error('Error during document-person association transaction:', error);
        throw error; // Re-throw the error
    }

    /**
     * Update document-person association
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @param {Object} data - Association data to update
     * @returns {Promise<Object>} Updated association
     */
    async updateDocumentPersonAssociation(documentId, personId, data) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if association exists
            const existingAssociation = await documentRepository.getDocumentPersonAssociation(
                documentId, 
                personId,
                { transaction }
            );
            
            if (!existingAssociation) {
                throw new Error('Document-person association not found');
            }
            
            // Update the association
            const association = await documentRepository.updateDocumentPersonAssociation(
                documentId, 
                personId, 
                data,
                { transaction }
            );
            
            return association;
        });
    }

    /**
     * Remove document-person association
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @returns {Promise<Boolean>} True if successful
     */
    async removeDocumentPersonAssociation(documentId, personId) {
        return await TransactionManager.executeTransaction(async (transaction) => {
            // Check if association exists
            const existingAssociation = await documentRepository.getDocumentPersonAssociation(
                documentId, 
                personId,
                { transaction }
            );
            
            if (!existingAssociation) {
                throw new Error('Document-person association not found');
            }
            
            // Remove the association
            return await documentRepository.removeDocumentPersonAssociation(
                documentId, 
                personId,
                { transaction }
            );
        });
    }

    /**
     * Get document-person association
     * 
     * @param {String} documentId - Document ID
     * @param {String} personId - Person ID
     * @returns {Promise<Object>} Association data
     */
    async getDocumentPersonAssociation(documentId, personId) {
        // Check if document exists
        const document = await documentRepository.findById(documentId);
        if (!document) {
            throw new Error(`Document with id ${documentId} not found`);
        }
        
        // Check if person exists
        const person = await personRepository.findById(personId);
        if (!person) {
            throw new Error(`Person with id ${personId} not found`);
        }
        
        return await documentRepository.getDocumentPersonAssociation(documentId, personId);
    }
}

module.exports = new DocumentService();
