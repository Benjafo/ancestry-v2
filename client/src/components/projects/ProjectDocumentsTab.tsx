import React, { useEffect, useState } from 'react';
import { Document, ProjectDetail, documentsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import { getDocumentTypeIcon } from '../../utils/iconUtils';
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

// Edit Document Modal Component
const EditDocumentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    projectId: string;
    onDocumentUpdated: (document: Document) => void;
}> = ({ isOpen, onClose, documentId, projectId, onDocumentUpdated }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <DocumentForm
                    documentId={documentId}
                    onSuccess={(document) => {
                        onDocumentUpdated(document);
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

    // State for document editing modal
    const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
    const [isEditDocumentModalOpen, setIsEditDocumentModalOpen] = useState(false);

    // State to track which document is being hovered
    const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);

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

    // Handler for editing a document
    const handleEditDocument = (documentId: string) => {
        setEditingDocumentId(documentId);
        setIsEditDocumentModalOpen(true);
        setIsViewDocumentModalOpen(false); // Close the view modal when opening edit
    };

    // Handler for deleting a document
    const handleDeleteDocument = async (documentId: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await documentsApi.deleteDocument(documentId);
                // Update local state to remove the deleted document
                setUniqueDocuments(prev => prev.filter(doc => doc.id !== documentId));
                setFilteredDocuments(prev => prev.filter(doc => doc.id !== documentId));

                // If the document was being viewed, close the modal
                if (viewingDocumentId === documentId) {
                    setIsViewDocumentModalOpen(false);
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                // Show error message to user
            }
        }
    };

    // Fetch documents directly associated with the project
    useEffect(() => {
        const fetchProjectDocuments = async () => {
            try {
                // Fetch documents directly associated with the project
                const documents = await documentsApi.getDocumentsByProjectId(project.id, { includePersons: true });

                // Transform documents to match the expected format
                const formattedDocs = documents.map(doc => ({
                    id: doc.document_id,
                    title: doc.title,
                    type: doc.document_type,
                    uploaded_at: doc.upload_date,
                    persons: doc.persons
                }));

                console.log('Project Documents:', formattedDocs);
                setUniqueDocuments(formattedDocs);
                setFilteredDocuments(formattedDocs);
            } catch (error) {
                console.error('Error fetching project documents:', error);
                // Fallback to documents from project if direct fetch fails
                if (project.documents && project.documents.length > 0) {
                    // Use a Map to deduplicate documents by ID
                    const uniqueDocsMap = new Map();
                    project.documents.forEach(doc => {
                        if (!uniqueDocsMap.has(doc.id)) {
                            uniqueDocsMap.set(doc.id, doc);
                        }
                    });
                    const uniqueDocs = Array.from(uniqueDocsMap.values());
                    setUniqueDocuments(uniqueDocs);
                    setFilteredDocuments(uniqueDocs);
                } else {
                    setUniqueDocuments([]);
                    setFilteredDocuments([]);
                }
            }
        };

        fetchProjectDocuments();
    }, [project.id]);

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
                                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative"
                                    onClick={() => handleViewDocument(document.id)}
                                    onMouseEnter={() => setHoveredDocumentId(document.id)}
                                    onMouseLeave={() => setHoveredDocumentId(null)}
                                >
                                    <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {getDocumentTypeIcon(document.type)}
                                            </div>
                                            <div className="min-w-0 flex-1 px-4">
                                                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">{document.title}</p>
                                                {/* Display associated person(s) or "Family Document" */}
                                                {document.persons && document.persons.length === 1 ? (
                                                    <p
                                                        className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent the link click from triggering the document item click
                                                            if (document.persons && onViewPerson) {
                                                                onViewPerson(document.persons[0].person_id);
                                                            }
                                                        }}
                                                    >
                                                        Associated with: {document.persons[0].first_name} {document.persons[0].last_name}
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        Family Document ({document.persons ? document.persons.length : 0} people)
                                                    </p>
                                                )}
                                                <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="truncate">Type: {formatDocumentType(document.type)}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {/* Action buttons - only visible on hover */}
                                            {project.access_level === 'edit' && project.status !== 'completed' && (
                                                <div className={`flex space-x-2 mr-4 transition-opacity duration-200 ${hoveredDocumentId === document.id ? 'opacity-100' : 'opacity-0'
                                                    }`}>
                                                    <button
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent document view from opening
                                                            handleEditDocument(document.id);
                                                        }}
                                                        title="Edit document"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent document view from opening
                                                            handleDeleteDocument(document.id);
                                                        }}
                                                        title="Delete document"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Date display */}
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                <time dateTime={document.uploaded_at}>
                                                    {document.uploaded_at ? formatDate(document.uploaded_at) : 'No date'}
                                                </time>
                                            </div>
                                        </div>
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
            {viewingDocumentId && (
                <ViewDocumentModal
                    isOpen={isViewDocumentModalOpen}
                    onClose={() => setIsViewDocumentModalOpen(false)}
                    documentId={viewingDocumentId}
                    onEdit={handleEditDocument}
                    onDelete={handleDeleteDocument}
                    isManager={project.access_level === 'edit'}
                    projectStatus={project.status}
                />
            )}

            {/* Edit Document Modal */}
            {editingDocumentId && (
                <EditDocumentModal
                    isOpen={isEditDocumentModalOpen}
                    onClose={() => setIsEditDocumentModalOpen(false)}
                    documentId={editingDocumentId}
                    projectId={project.id}
                    onDocumentUpdated={handleDocumentAdded}
                />
            )}
        </div >
    );
};

export default ProjectDocumentsTab;
