import { useEffect, useState } from 'react';
import { Document, documentsApi } from '../../api/client';
import { capitalizeWords } from '../../utils/formatUtils';
import EmptyState from '../common/EmptyState';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import ViewDocumentModal from './ViewDocumentModal';

// Helper function to extract error message safely
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error) || 'An unknown error occurred';
};

interface DocumentListProps {
    personId?: string;
    onEditDocument?: (documentId: string) => void;
    onDeleteDocument?: (documentId: string) => void;
    onSelectDocument?: (document: Document) => void;
    readOnly?: boolean;
}

const DocumentList = ({ personId, onEditDocument, onDeleteDocument, onSelectDocument, readOnly = false }: DocumentListProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    // State for document viewing modal
    const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
    const [isViewDocumentModalOpen, setIsViewDocumentModalOpen] = useState(false);

    const documentTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'certificate', label: 'Certificate' },
        { value: 'photo', label: 'Photo' },
        { value: 'letter', label: 'Letter' },
        { value: 'record', label: 'Record' },
        { value: 'newspaper', label: 'Newspaper' },
        { value: 'census', label: 'Census' },
        { value: 'military', label: 'Military' },
        { value: 'legal', label: 'Legal' },
        { value: 'map', label: 'Map' },
        { value: 'audio', label: 'Audio' },
        { value: 'video', label: 'Video' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        const fetchDocuments = async () => {
            setIsLoading(true);
            try {
                let documentsData;

                if (personId) {
                    documentsData = await documentsApi.getDocumentsByPersonId(personId);
                } else {
                    const response = await documentsApi.getDocuments();
                    documentsData = response.documents;
                }

                setDocuments(documentsData);
                setFilteredDocuments(documentsData);
            } catch (err: unknown) {
                setError(getErrorMessage(err) || 'Failed to load documents');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocuments();
    }, [personId]);

    useEffect(() => {
        // Apply filters whenever documents, searchTerm, or filterType changes
        let result = [...documents];

        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(document => document.document_type === filterType);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(document =>
                (document.title && document.title.toLowerCase().includes(term)) ||
                (document.description && document.description.toLowerCase().includes(term)) ||
                (document.source && document.source.toLowerCase().includes(term))
            );
        }

        setFilteredDocuments(result);
    }, [documents, searchTerm, filterType]);

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
            case 'newspaper':
                return (
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                );
            case 'audio':
                return (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0l-2.828 2.828a1 1 0 01-1.414 0l-.707-.707a1 1 0 010-1.414L5.88 14.05m9.9-9.9l1.414-1.414a1 1 0 011.414 0l.707.707a1 1 0 010 1.414l-2.828 2.828m-9.9 9.9L3.05 17.657m0 0a9 9 0 0112.728 0M6.343 6.343a9 9 0 0112.728 0M6.343 6.343L3.515 3.515a1 1 0 010-1.414l.707-.707a1 1 0 011.414 0l2.828 2.828m0 0a5 5 0 017.072 0m0 0l-2.828 2.828" />
                    </svg>
                );
            case 'video':
                return (
                    <svg className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

    // Using the utility function instead of a local function

    const handleEdit = (documentId: string) => {
        if (onEditDocument) {
            onEditDocument(documentId);
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!onDeleteDocument) return;

        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await documentsApi.deleteDocument(documentId);
                setDocuments(documents.filter(document => document.document_id !== documentId));
                onDeleteDocument(documentId);
            } catch (err: unknown) {
                setError(getErrorMessage(err) || 'Failed to delete document');
                console.error(err);
            }
        }
    };

    const handleSelect = (document: Document) => {
        if (onSelectDocument) {
            onSelectDocument(document);
        } else {
            // If no onSelectDocument is provided, open the document viewer
            setViewingDocumentId(document.document_id);
            setIsViewDocumentModalOpen(true);
        }
    };

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Search by title, description, or source"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="document-type-filter" className="sr-only">Filter by type</label>
                    <select
                        id="document-type-filter"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {documentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredDocuments.length === 0 ? (
                <EmptyState message="No documents found." />
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredDocuments.map(document => (
                            <li key={document.document_id}>
                                <div
                                    className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => handleSelect(document)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {getDocumentTypeIcon(document.document_type)}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                                                    {document.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {capitalizeWords(document.document_type)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {document.upload_date ? new Date(document.upload_date).toLocaleDateString() : 'Unknown date'}
                                            </p>

                                            {!readOnly && (
                                                <div className="mt-2 flex space-x-2">
                                                    {onEditDocument && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(document.document_id);
                                                            }}
                                                            className="text-primary-600 hover:text-primary-900"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {onDeleteDocument && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(document.document_id);
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {document.description && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {document.description}
                                            </p>
                                        </div>
                                    )}

                                    {document.source && (
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-gray-600 dark:text-gray-300">Source: {document.source}</span>
                                            {document.date_of_original && (
                                                <span className="ml-2 text-gray-600 dark:text-gray-300">({new Date(document.date_of_original).toLocaleDateString()})</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* View Document Modal */}
            {viewingDocumentId && (
                <ViewDocumentModal
                    isOpen={isViewDocumentModalOpen}
                    onClose={() => setIsViewDocumentModalOpen(false)}
                    documentId={viewingDocumentId}
                />
            )}
        </div>
    );
};

export default DocumentList;
