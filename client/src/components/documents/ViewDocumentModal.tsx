import React, { useEffect, useState } from 'react';
import { Document, documentsApi } from '../../api/client';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

interface ViewDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    onEdit?: (documentId: string) => void; // For editing
    onDelete?: (documentId: string) => void; // For deleting
    isManager?: boolean; // To control button visibility
    projectStatus?: 'active' | 'completed' | 'on_hold'; // To check if project is editable
}

const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({ 
    isOpen, 
    onClose, 
    documentId, 
    onEdit,
    onDelete,
    isManager = false,
    projectStatus = 'active'
}) => {
    // Add state to track if header is being hovered
    const [isHeaderHovered, setIsHeaderHovered] = useState(false);
    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && documentId) {
            fetchDocument();
        }
    }, [isOpen, documentId]);

    const fetchDocument = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const doc = await documentsApi.getDocumentById(documentId);
            setDocument(doc);
        } catch (err) {
            console.error('Error fetching document:', err);
            setError('Failed to load document details');
        } finally {
            setIsLoading(false);
        }
    };

    // Format document type for display
    const formatDocumentType = (documentType: string): string => {
        if (!documentType) return 'Unknown';

        // Convert snake_case or kebab-case to spaces
        const formatted = documentType.replace(/[_-]/g, ' ');

        // Capitalize each word
        return formatted
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Render different viewers based on mime_type
    const renderDocumentViewer = () => {
        if (!document) return null;

        const fileUrl = `/api/documents/${documentId}/file`;
        const downloadUrl = `/api/documents/${documentId}/file?download=true`;

        if (document.mime_type?.startsWith('image/')) {
            return (
                <div className="document-viewer">
                    <img
                        src={fileUrl}
                        alt={document.title}
                        className="max-w-full h-auto mx-auto rounded-md shadow-md"
                    />
                </div>
            );
        } else if (document.mime_type === 'application/pdf') {
            return (
                <div className="document-viewer h-96">
                    <iframe
                        src={fileUrl}
                        className="w-full h-full border-0 rounded-md shadow-md"
                        title={document.title}
                    />
                </div>
            );
        } else {
            return (
                <div className="document-viewer text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <svg className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Preview not available for this file type.
                    </p>
                </div>
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal header with close button */}
                <div 
                    className="flex justify-between items-center mb-4"
                    onMouseEnter={() => setIsHeaderHovered(true)}
                    onMouseLeave={() => setIsHeaderHovered(false)}
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isLoading ? 'Loading Document...' : document ? document.title : 'Document Viewer'}
                    </h2>
                    <div className="flex items-center space-x-2">
                        {/* Show buttons only for managers on active projects when hovered */}
                        {isManager && projectStatus !== 'completed' && document && (
                            <div className={`flex space-x-2 transition-opacity duration-200 ${
                                isHeaderHovered ? 'opacity-100' : 'opacity-0'
                            }`}>
                                {onEdit && (
                                    <button
                                        onClick={() => onEdit(documentId)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        title="Edit Document"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this document?')) {
                                                onDelete(documentId);
                                                onClose();
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete Document"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Loading state */}
                {isLoading && <LoadingSpinner />}

                {/* Error state */}
                {error && !isLoading && <ErrorAlert message={error} />}

                {/* Document content */}
                {!isLoading && !error && document && (
                    <>
                        {/* Document metadata */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                                <p className="text-gray-900 dark:text-white">{formatDocumentType(document.document_type)}</p>
                            </div>
                            {document.date_of_original && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Original Date</p>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(document.date_of_original).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {document.source && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Source</p>
                                    <p className="text-gray-900 dark:text-white">{document.source}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</p>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(document.upload_date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Document description if available */}
                        {document.description && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                                <p className="text-gray-600 dark:text-gray-300">{document.description}</p>
                            </div>
                        )}

                        {/* Document viewer */}
                        <div className="mb-6">
                            {renderDocumentViewer()}
                        </div>

                        {/* Download button */}
                        <div className="flex justify-end">
                            <a
                                href={`/api/documents/${documentId}/file?download=true`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600"
                                download
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewDocumentModal;
