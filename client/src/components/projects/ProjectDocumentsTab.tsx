import React, { useEffect, useState } from 'react';
import { Document, ProjectDetail } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import DocumentForm from '../documents/DocumentForm';
import ViewDocumentModal from '../documents/ViewDocumentModal';

interface ProjectDocumentsTabProps {
    project: ProjectDetail;
    onDocumentAdded?: (document: Document) => void;
    onViewPerson?: (personId: string) => void; // Add onViewPerson prop
}

const AddDocumentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onDocumentAdded: (document: Document) => void;
}> = ({ isOpen, onClose, projectId, onDocumentAdded }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <DocumentForm
                    onSuccess={(document) => {
                        onDocumentAdded(document);
                        onClose();
                    }}
                    onCancel={onClose}
                    initialData={{ project_id: projectId }}
                />
            </div>
        </div>
    );
};

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ project, onDocumentAdded, onViewPerson }) => {
    // State to store unique documents and search term
    const [uniqueDocuments, setUniqueDocuments] = useState<ProjectDetail['documents']>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<ProjectDetail['documents']>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);

    // State for document viewing modal
    const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
    const [isViewDocumentModalOpen, setIsViewDocumentModalOpen] = useState(false);

    // Handler for opening the add document modal
    const handleAddDocument = () => {
        setIsAddDocumentModalOpen(true);
    };

    // Handler for document added
    const handleDocumentAdded = (document: Document) => {
        // Add the document to local state for immediate UI update
        const newDocument = {
            id: document.document_id,
            title: document.title,
            type: document.document_type,
            uploaded_at: document.upload_date
        };

        setUniqueDocuments(prev => [...prev, newDocument]);

        // Call the parent callback to refresh project data
        if (onDocumentAdded) {
            onDocumentAdded(document);
        }
    };

    // Handler for viewing a document
    const handleViewDocument = (documentId: string) => {
        setViewingDocumentId(documentId);
        setIsViewDocumentModalOpen(true);
    };

    // Remove duplicate documents based on ID
    useEffect(() => {
        if (project.documents && project.documents.length > 0) {
            // Use a Map to deduplicate documents by ID
            const uniqueDocsMap = new Map();
            project.documents.forEach(doc => {
                if (!uniqueDocsMap.has(doc.id)) {
                    uniqueDocsMap.set(doc.id, doc);
                }
            });
            const uniqueDocs = Array.from(uniqueDocsMap.values());
            console.log('Documents:', uniqueDocs);
            setUniqueDocuments(uniqueDocs);
            setFilteredDocuments(uniqueDocs);
        } else {
            setUniqueDocuments([]);
            setFilteredDocuments([]);
        }
    }, [project.documents]);

    // Filter documents based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDocuments(uniqueDocuments);
        } else {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const filtered = uniqueDocuments.filter(doc =>
                doc.title.toLowerCase().includes(lowerSearchTerm) ||
                (doc.type && doc.type.toLowerCase().includes(lowerSearchTerm))
                // ||
                // (doc.person_name && doc.person_name.toLowerCase().includes(lowerSearchTerm))
            );
            setFilteredDocuments(filtered);
        }
    }, [searchTerm, uniqueDocuments]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Format document type for display
    const formatDocumentType = (type?: string): string => {
        if (!type) return 'Unknown';

        // Convert snake_case or kebab-case to spaces
        const formatted = type.replace(/[_-]/g, ' ');

        // Capitalize each word
        return formatted
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const getDocumentTypeIcon = (type?: string) => {
        if (!type) type = 'other';

        switch (type.toLowerCase()) {
            case 'certificate':
                return (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'record':
                return (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
                    <svg className="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'newspaper':
                return (
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                );
            case 'census':
                return (
                    <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                );
            case 'military':
                return (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case 'legal':
                return (
                    <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                );
            case 'map':
                return (
                    <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                );
            case 'audio':
                return (
                    <svg className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                );
            case 'video':
                return (
                    <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
                <div className="flex space-x-4">
                    {project.access_level === 'edit' && project.status !== 'completed' && (
                        <button
                            className="btn-primary"
                            onClick={handleAddDocument}
                            title="Add a new document to this project"
                        >
                            Add Document
                        </button>
                    )}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="form-input py-2 pl-10 pr-4 rounded-md"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
                {filteredDocuments.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredDocuments.map((document) => (
                            <li key={document.id || document.id}>
                                <div
                                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => handleViewDocument(document.id)}
                                >
                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                        <div className="flex-shrink-0">
                                            {getDocumentTypeIcon(document.type)}
                                        </div>
                                        <div className="min-w-0 flex-1 px-4">
                                            <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">{document.title}</p>
                                            {/* Display associated person(s) or "Family Document" */}
                                            {document.persons && document.persons.length > 0 ? (
                                                document.persons.length === 1 && document.persons[0] ? ( // Added check for document.persons[0]
                                                    <p
                                                        className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent the link click from triggering the document item click
                                                            document.persons && onViewPerson && onViewPerson(document.persons[0].person_id);
                                                        }}
                                                    >
                                                        Associated with: {document.persons[0].first_name} {document.persons[0].last_name}
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        Family Document ({document.persons ? document.persons.length : 0} people) {/* Added check for document.persons */}
                                                    </p>
                                                )
                                            ) : (
                                                <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    No associated persons
                                                </p>
                                            )}
                                            <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span className="truncate">Type: {formatDocumentType(document.type)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {document.uploaded_at ? formatDate(document.uploaded_at) : 'No date'}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No documents have been added to this project yet.</p>
                    </div>
                )}
            </div>

            {/* Add Document Modal */}
            <AddDocumentModal
                isOpen={isAddDocumentModalOpen}
                onClose={() => setIsAddDocumentModalOpen(false)}
                projectId={project.id}
                onDocumentAdded={handleDocumentAdded}
            />

            {/* View Document Modal */}
            {
                viewingDocumentId && (
                    <ViewDocumentModal
                        isOpen={isViewDocumentModalOpen}
                        onClose={() => setIsViewDocumentModalOpen(false)}
                        documentId={viewingDocumentId}
                    />
                )
            }
        </div >
    );
};

export default ProjectDocumentsTab;
