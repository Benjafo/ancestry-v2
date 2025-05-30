import { useEffect, useState } from 'react';
import { Document, documentsApi } from '../../api/client';
import { capitalizeWords } from '../../utils/formatUtils';
import { formatDate } from '../../utils/dateUtils';
import EmptyState from '../common/EmptyState';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import ViewDocumentModal from './ViewDocumentModal';
import { getDocumentTypeIcon } from '../../utils/iconUtils';
import { getApiErrorMessage } from '../../utils/errorUtils';

interface DocumentListProps {
    personId?: string;
    documents: Document[]; // Accept documents as a prop
    isLoading: boolean; // Accept loading state as a prop
    error: string | null; // Accept error state as a prop
    onEditDocument?: (documentId: string) => void;
    onDeleteDocument?: (documentId: string) => void;
    onSelectDocument?: (document: Document) => void;
    readOnly?: boolean;
    viewMode: 'grid' | 'list'; // New prop for view mode
}

const DocumentList = ({ documents, isLoading, error, onEditDocument, onDeleteDocument, onSelectDocument, readOnly = false, viewMode }: DocumentListProps) => {
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
        // Apply filters whenever documents prop, searchTerm, or filterType changes
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
                onDeleteDocument(documentId); // Let the parent handle state update
            } catch (err: unknown) {
                const errorMessage = await getApiErrorMessage(err);
                // Let the parent handle error display, but log the specific message
                console.error(errorMessage);
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
                            <svg className="h-5 w-5 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md"
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
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
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
                    <ul className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4" : "divide-y divide-gray-200 dark:divide-gray-700"}>
                        {filteredDocuments.map(document => (
                            <li key={document.document_id} className={viewMode === 'grid' ? "bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm" : ""}>
                                <div
                                    className={viewMode === 'grid'
                                        ? "block p-4 cursor-pointer relative"
                                        : "px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }
                                    onClick={() => handleSelect(document)}
                                >
                                    <div className={viewMode === 'grid' ? "flex flex-col items-center justify-center text-center" : "flex items-center justify-between"}>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {getDocumentTypeIcon(document.document_type)}
                                            </div>
                                            <div className={viewMode === 'grid' ? "mt-2" : "ml-4"}>
                                                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                                                    {document.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {capitalizeWords(document.document_type)}
                                                </p>
                                            </div>
                                        </div>

                                        {viewMode === 'list' && (
                                            <div className="flex flex-col items-end">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(document.upload_date, 'Unknown date')}
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
                                        )}
                                    </div>

                                    {document.description && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {document.description}
                                            </p>
                                        </div>
                                    )}

                                    {document.source && (
                                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-gray-600 dark:text-gray-300">Source: {document.source}</span>
                                            {document.date_of_original && (
                                                <span className="ml-2 text-gray-600 dark:text-gray-300">({formatDate(document.date_of_original)})</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {viewMode === 'grid' && !readOnly && (
                                    <div className="flex justify-center space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
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
