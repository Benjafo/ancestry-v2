import React, { useEffect, useRef, useState } from 'react';
import { Document, documentsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

interface AddExistingDocumentToPersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    personId: string;
    onDocumentAssociated: () => void;
}

const AddExistingDocumentToPersonModal: React.FC<AddExistingDocumentToPersonModalProps> = ({
    isOpen,
    onClose,
    personId,
    onDocumentAssociated
}) => {
    // State for search and results
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [associationNotes, setAssociationNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAssociating, setIsAssociating] = useState(false);

    // Ref for debouncing search
    const searchTimeoutRef = useRef<number | null>(null);

    // Effect for searching documents
    useEffect(() => {
        // Clear any existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Don't search if term is too short
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        // Set a new timeout for debouncing
        searchTimeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await documentsApi.getDocuments({ search: searchTerm });
                setSearchResults(response.documents || []);
            } catch (err) {
                console.error('Error searching documents:', err);
                setError('Failed to search documents. Please try again.');
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500); // 500ms debounce

        // Cleanup function
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm]);

    // Reset state when modal is opened/closed
    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal is closed
            setSearchTerm('');
            setSearchResults([]);
            setSelectedDocument(null);
            setAssociationNotes('');
            setError(null);
        }
    }, [isOpen]);

    // Handle document selection
    const handleSelectDocument = (document: Document) => {
        setSelectedDocument(document);
    };

    // Handle association notes change
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAssociationNotes(e.target.value);
    };

    // Handle associate document button click
    const handleAssociateDocument = async () => {
        if (!selectedDocument) return;

        setIsAssociating(true);
        setError(null);

        try {
            await documentsApi.associateDocumentWithPerson(
                selectedDocument.document_id,
                personId,
                { notes: associationNotes }
            );

            // Call the callback to refresh data
            onDocumentAssociated();

            // Close the modal
            onClose();
        } catch (err) {
            console.error('Error associating document:', err);
            setError('Failed to associate document. Please try again.');
        } finally {
            setIsAssociating(false);
        }
    };

    // Helper function to get document type icon
    const getDocumentTypeIcon = (documentType: string) => {
        switch (documentType) {
            case 'certificate':
                return (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'photo':
                return (
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'letter':
                return (
                    <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'record':
                return (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
        }
    };

    // Format document type for display
    const formatDocumentType = (type: string): string => {
        if (!type) return 'Unknown';

        // Convert snake_case or kebab-case to spaces
        const formatted = type.replace(/[_-]/g, ' ');

        // Capitalize each word
        return formatted
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Add Existing Document to Person
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search input */}
                <div className="mb-4">
                    <label htmlFor="document-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Documents
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="document-search"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                            placeholder="Search by title, description, or source"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Type at least 2 characters to search
                    </p>
                </div>

                {/* Search results */}
                <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                        Search Results
                    </h3>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="md" />
                        </div>
                    )}

                    {/* Error state */}
                    {error && !isLoading && (
                        <ErrorAlert message={error} />
                    )}

                    {/* No results */}
                    {!isLoading && !error && searchResults.length === 0 && searchTerm.length >= 2 && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No documents found matching your search.
                        </div>
                    )}

                    {/* Results list */}
                    {!isLoading && !error && searchResults.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                                {searchResults.map(document => (
                                    <li
                                        key={document.document_id}
                                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedDocument?.document_id === document.document_id
                                                ? 'bg-primary-50 dark:bg-primary-900'
                                                : ''
                                            }`}
                                        onClick={() => handleSelectDocument(document)}
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    {getDocumentTypeIcon(document.document_type)}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                                                        {document.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDocumentType(document.document_type)}
                                                    </p>
                                                    {document.upload_date && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Uploaded: {formatDate(document.upload_date)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Association notes */}
                {selectedDocument && (
                    <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                            Association Notes
                        </h3>
                        <div className="mt-1">
                            <textarea
                                id="association-notes"
                                name="notes"
                                rows={3}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                                placeholder="Add notes about this document's relevance to the person (optional)"
                                value={associationNotes}
                                onChange={handleNotesChange}
                            />
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAssociateDocument}
                        disabled={!selectedDocument || isAssociating}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAssociating ? 'Associating...' : 'Associate Document'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddExistingDocumentToPersonModal;
