import React, { useEffect, useRef, useState } from 'react';
import { Document, documentsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import { getApiErrorMessage } from '../../utils/errorUtils';
import { getDocumentTypeIcon } from '../../utils/iconUtils';
import BaseModal from '../common/BaseModal'; // Import BaseModal
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
            } catch (err: unknown) {
                const errorMessage = await getApiErrorMessage(err);
                console.error('Error searching documents:', errorMessage);
                setError(errorMessage);
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
            setError(null);
        }
    }, [isOpen]);

    // Handle document selection
    const handleSelectDocument = (document: Document) => {
        setSelectedDocument(document);
    };

    // Handle associate document button click
    const handleAssociateDocument = async () => {
        if (!selectedDocument) return;

        setIsAssociating(true);
        setError(null);

        try {
            await documentsApi.associateDocumentWithPerson(
                selectedDocument.document_id,
                personId
            );

            // Call the callback to refresh data
            onDocumentAssociated();

            // Close the modal
            onClose();
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error associating document:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsAssociating(false);
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

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Add Existing Document to Person" size="2xl">
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
        </BaseModal>
    );
};

export default AddExistingDocumentToPersonModal;
