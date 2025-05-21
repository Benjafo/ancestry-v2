import React, { useEffect, useState } from 'react';
import { ApiError, Document, Event, Person, documentsApi, projectsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import DocumentForm from '../documents/DocumentForm';
import DocumentList from '../documents/DocumentList';
import EventForm from '../events/EventForm';
import EventList from '../events/EventList';
import AddExistingDocumentToPersonModal from './AddExistingDocumentToPersonModal';

interface EditPersonModalProps {
    person: Person;
    isOpen: boolean;
    onClose: () => void;
    onPersonUpdated: (updatedPerson: Person) => void;
}

const EditPersonModal: React.FC<EditPersonModalProps> = ({
    person,
    isOpen,
    onClose,
    onPersonUpdated
}) => {
    // Tab state
    const [activeTab, setActiveTab] = useState<'info' | 'events' | 'documents' | 'relationships'>('info');

    // Basic person info state
    const [formData, setFormData] = useState({
        first_name: person.first_name || '',
        middle_name: person.middle_name || '',
        last_name: person.last_name || '',
        maiden_name: person.maiden_name || '',
        gender: person.gender || '',
        birth_date: person.birth_date || '',
        birth_location: person.birth_location || '',
        death_date: person.death_date || '',
        death_location: person.death_location || '',
        notes: person.notes || ''
    });

    // Events state
    const [events, setEvents] = useState<Event[]>([]);
    const [deletedEventIds, setDeletedEventIds] = useState<string[]>([]);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Documents state
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentsToAssociate, setDocumentsToAssociate] = useState<Document[]>([]);
    const [deletedDocumentIds, setDeletedDocumentIds] = useState<string[]>([]);
    const [isAddingDocument, setIsAddingDocument] = useState(false);
    const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
    const [isAddExistingDocumentModalOpen, setIsAddExistingDocumentModalOpen] = useState(false);

    // Relationships state (read-only)
    const [relationships, setRelationships] = useState<Person['relationships']>({});

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetchingData, setIsFetchingData] = useState(true);

    // Fetch person details including events, documents, and relationships
    useEffect(() => {
        if (isOpen) {
            const fetchPersonDetails = async () => {
                setIsFetchingData(true);
                try {
                    const personData = await projectsApi.getPersonById(person.person_id, {
                        includeEvents: true,
                        includeDocuments: true,
                        includeRelationships: true
                    });

                    // Set events
                    if (personData.events) {
                        setEvents(personData.events);
                    }

                    // Set documents
                    if (personData.documents) {
                        setDocuments(personData.documents);
                    }

                    // Set relationships
                    if (personData.relationships) {
                        setRelationships(personData.relationships);
                    }
                } catch (err) {
                    console.error('Error fetching person details:', err);
                    setError('Failed to load person details');
                } finally {
                    setIsFetchingData(false);
                }
            };

            fetchPersonDetails();
        }
    }, [isOpen, person.person_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            setError('First name is required');
            return false;
        }

        if (!formData.last_name.trim()) {
            setError('Last name is required');
            return false;
        }

        if (!formData.gender) {
            setError('Gender is required');
            return false;
        }

        if (!formData.birth_date) {
            setError('Birth date is required');
            return false;
        }

        // Check if death date is after birth date if both are provided
        if (formData.birth_date && formData.death_date) {
            const birthDate = new Date(formData.birth_date);
            const deathDate = new Date(formData.death_date);

            if (deathDate < birthDate) {
                setError('Death date cannot be before birth date');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log('handleSubmit called');
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare form data - only include fields with values to avoid validation errors
            const cleanedFormData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                gender: formData.gender,
                birth_date: formData.birth_date,
                // Only include optional fields if they have values
                ...(formData.middle_name ? { middle_name: formData.middle_name } : {}),
                ...(formData.maiden_name ? { maiden_name: formData.maiden_name } : {}),
                ...(formData.birth_location ? { birth_location: formData.birth_location } : {}),
                ...(formData.death_date ? { death_date: formData.death_date } : {}),
                ...(formData.death_location ? { death_location: formData.death_location } : {}),
                ...(formData.notes ? { notes: formData.notes } : {})
            };

            // Step 1: Update the person's basic info with events and deletedEventIds
            await projectsApi.updatePerson(person.person_id, {
                ...cleanedFormData,
                events,
                deletedEventIds
            });

            // Step 3: Handle documents
            // Handle documents that were newly created in the DocumentForm and need association
            console.log('Documents to associate:', documentsToAssociate);
            for (const document of documentsToAssociate) {
                console.log('Calling associateDocumentWithPerson for document', document.document_id, 'and person', person.person_id);
                await documentsApi.associateDocumentWithPerson(
                    document.document_id,
                    person.person_id
                );
            }
            // Clear the list of documents to associate after processing
            setDocumentsToAssociate([]);

            // Handle documents that were already associated and might have been updated or deleted
            // For updated documents (have document_id and are still in the documents state)
            // const updatedDocuments = documents.filter(doc => doc.document_id && !deletedDocumentIds.includes(doc.document_id));
            // for (const _document of updatedDocuments) {
            // Note: The DocumentForm handles updating existing documents directly.
            // This loop might be redundant if the form updates immediately,
            // but keeping it for robustness if there's a different workflow.
            // In this specific case (EditPersonModal), the form updates immediately,
            // so this loop won't do anything for documents that were edited via the form.
            // It would only apply if documents were edited in the list directly (which is not the current UI).
            // We can potentially remove this loop if the DocumentForm always handles updates.
            // For now, let's keep it but be aware it might not be actively used in this modal's workflow.
            // await documentsApi.updateDocument(docData.document_id, docData);
            // }

            // For deleted documents
            for (const docId of deletedDocumentIds) {
                await documentsApi.removeDocumentPersonAssociation(docId, person.person_id);
            }

            // Fetch the updated person with all related data
            const refreshedPerson = await projectsApi.getPersonById(person.person_id, {
                includeEvents: true,
                includeDocuments: true,
                includeRelationships: true
            });

            onPersonUpdated(refreshedPerson);
            onClose();
        } catch (err: unknown) {
            console.error('Error updating person:', err);
            const error = err as ApiError;
            setError(error.message || 'Failed to update person');
        } finally {
            setLoading(false);
        }
    };

    // Event handlers
    const handleAddEvent = () => {
        setIsAddingEvent(true);
    };

    const handleEditEvent = (eventId: string) => {
        setEditingEventId(eventId);
    };

    const handleDeleteEvent = (eventId: string) => {
        // If it's a new event (no ID yet), just remove it from the list
        if (!eventId) {
            setEvents(events.filter(event => event.event_id !== eventId));
            return;
        }

        // Otherwise, mark it for deletion on save
        setDeletedEventIds([...deletedEventIds, eventId]);
        setEvents(events.filter(event => event.event_id !== eventId));
    };

    const handleEventSaved = (event: Event) => {
        if (editingEventId) {
            // Update existing event
            setEvents(events.map(e => e.event_id === editingEventId ? event : e));
            setEditingEventId(null);
        } else {
            // Add new event
            setEvents([...events, event]);
            setIsAddingEvent(false);
        }
    };

    // Document handlers
    const handleAddDocument = () => {
        setIsAddingDocument(true);
    };

    const handleEditDocument = (documentId: string) => {
        setEditingDocumentId(documentId);
    };

    const handleDeleteDocument = async (documentId: string) => {
        // If it's a new document (no ID yet), just remove it from the list
        if (!documentId) {
            setDocuments(documents.filter(doc => doc.document_id !== documentId));
            return;
        }

        // If it's an existing document, call the API to remove the association
        try {
            await documentsApi.removeDocumentPersonAssociation(documentId, person.person_id);
            // Remove the document from the local state after successful API call
            setDocuments(documents.filter(doc => doc.document_id !== documentId));
            // Also remove from deletedDocumentIds if it was marked for deletion
            setDeletedDocumentIds(deletedDocumentIds.filter(id => id !== documentId));
        } catch (err: unknown) {
            console.error('Error removing document association:', err);
            const error = err as ApiError;
            setError(error.message || 'Failed to remove document association');
        }
    };

    const handleDocumentSaved = (document: Document) => {
        if (editingDocumentId) {
            // Update existing document in the main documents list
            setDocuments(documents.map(d => d.document_id === editingDocumentId ? document : d));
            setEditingDocumentId(null);
        } else {
            // Add new document to the list to associate later AND to the main list for immediate display
            setDocumentsToAssociate([...documentsToAssociate, document]);
            setDocuments([...documents, document]); // Add to main list
            setIsAddingDocument(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Edit Person: {person.first_name} {person.last_name}
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

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex -mb-px">
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'info'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('info')}
                        >
                            Biographical Info
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'events'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('events')}
                        >
                            Events
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'documents'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('documents')}
                        >
                            Documents
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'relationships'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('relationships')}
                        >
                            Relationships
                        </button>
                    </nav>
                </div>

                {/* Loading state */}
                {isFetchingData && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                )}

                {/* Error state */}
                {error && !isFetchingData && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab content */}
                {!isFetchingData && (
                    <div>
                        {/* Biographical Info Tab */}
                        {activeTab === 'info' && (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            name="middle_name"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.middle_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Maiden Name
                                        </label>
                                        <input
                                            type="text"
                                            name="maiden_name"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.maiden_name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Gender *
                                        </label>
                                        <select
                                            name="gender"
                                            className="form-select w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="unknown">Unknown</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Birth Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="birth_date"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.birth_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Birth Location
                                        </label>
                                        <input
                                            type="text"
                                            name="birth_location"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.birth_location}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Death Date
                                        </label>
                                        <input
                                            type="date"
                                            name="death_date"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.death_date}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Death Location
                                        </label>
                                        <input
                                            type="text"
                                            name="death_location"
                                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                                            value={formData.death_location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                                        rows={4}
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Add any additional notes about this person..."
                                    />
                                </div>
                            </form>
                        )}

                        {/* Events Tab */}
                        {activeTab === 'events' && (
                            <div>
                                {isAddingEvent || editingEventId ? (
                                    <EventForm
                                        personId={person.person_id}
                                        projectId={person.project_persons && Array.isArray(person.project_persons)
                                            ? person.project_persons[0]?.project_id
                                            : undefined}
                                        eventId={editingEventId || undefined}
                                        onSuccess={handleEventSaved}
                                        onCancel={() => {
                                            setIsAddingEvent(false);
                                            setEditingEventId(null);
                                        }}
                                    />
                                ) : (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Events</h3>
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={handleAddEvent}
                                            >
                                                Add Event
                                            </button>
                                        </div>

                                        <EventList
                                            personId={person.person_id}
                                            projectId={person.project_persons && Array.isArray(person.project_persons)
                                                ? person.project_persons[0]?.project_id
                                                : undefined}
                                            onEditEvent={handleEditEvent}
                                            onDeleteEvent={handleDeleteEvent}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div>
                                {isAddingDocument || editingDocumentId ? (
                                    <DocumentForm
                                        documentId={editingDocumentId || undefined}
                                        onSuccess={handleDocumentSaved}
                                        onCancel={() => {
                                            setIsAddingDocument(false);
                                            setEditingDocumentId(null);
                                        }}
                                    />
                                ) : (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => setIsAddExistingDocumentModalOpen(true)}
                                                >
                                                    Add Existing Document
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    onClick={handleAddDocument}
                                                >
                                                    Add Document
                                                </button>
                                            </div>
                                        </div>

                                        <DocumentList
                                            documents={documents} // Pass documents state as prop
                                            isLoading={loading} // Pass loading state as prop
                                            error={error} // Pass error state as prop
                                            personId={person.person_id}
                                            onEditDocument={handleEditDocument}
                                            onDeleteDocument={handleDeleteDocument}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Relationships Tab (Read-only) */}
                        {activeTab === 'relationships' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relationships</h3>

                                {relationships && Object.keys(relationships).length > 0 ? (
                                    <div className="space-y-6">
                                        {/* Spouses */}
                                        {relationships.spouses && relationships.spouses.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spouses</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {relationships.spouses.map(spouse => (
                                                        <div key={spouse.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{spouse.first_name} {spouse.last_name}</p>
                                                            {spouse.start_date && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Married: {formatDate(spouse.start_date)}
                                                                    {spouse.end_date && ` - ${formatDate(spouse.end_date)}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Parents */}
                                        {relationships.parents && relationships.parents.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parents</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {relationships.parents.map(parent => (
                                                        <div key={parent.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{parent.first_name} {parent.last_name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {parent.relationship_qualifier && `${parent.relationship_qualifier} parent`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Children */}
                                        {relationships.children && relationships.children.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Children</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {relationships.children.map(child => (
                                                        <div key={child.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{child.first_name} {child.last_name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {child.relationship_qualifier && `${child.relationship_qualifier} child`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Siblings */}
                                        {relationships.siblings && relationships.siblings.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Siblings</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {relationships.siblings.map(sibling => (
                                                        <div key={sibling.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{sibling.first_name} {sibling.last_name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {sibling.relationship_qualifier && `${sibling.relationship_qualifier} sibling`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Grandparents */}
                                        {(relationships as any).grandparents && (relationships as any).grandparents.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grandparents</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(relationships as any).grandparents.map((grandparent: any) => (
                                                        <div key={grandparent.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{grandparent.first_name} {grandparent.last_name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Grandchildren */}
                                        {(relationships as any).grandchildren && (relationships as any).grandchildren.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grandchildren</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(relationships as any).grandchildren.map((grandchild: any) => (
                                                        <div key={grandchild.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{grandchild.first_name} {grandchild.last_name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Aunts/Uncles */}
                                        {(relationships as any).auntsUncles && (relationships as any).auntsUncles.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aunts & Uncles</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(relationships as any).auntsUncles.map((auntUncle: any) => (
                                                        <div key={auntUncle.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{auntUncle.first_name} {auntUncle.last_name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Nieces/Nephews */}
                                        {(relationships as any).niecesNephews && (relationships as any).niecesNephews.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nieces & Nephews</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(relationships as any).niecesNephews.map((nieceNephew: any) => (
                                                        <div key={nieceNephew.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{nieceNephew.first_name} {nieceNephew.last_name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cousins */}
                                        {(relationships as any).cousins && (relationships as any).cousins.length > 0 && (
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cousins</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(relationships as any).cousins.map((cousin: any) => (
                                                        <div key={cousin.person_id} className="border dark:border-gray-700 rounded-lg p-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{cousin.first_name} {cousin.last_name}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No relationships found for this person.</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            You can add parent and spouse relationships from the person's detail view.
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Other relationships like siblings, grandparents, aunts/uncles, and cousins will be automatically calculated based on the parent relationships.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer with action buttons */}
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Add Existing Document Modal */}
                <AddExistingDocumentToPersonModal
                    isOpen={isAddExistingDocumentModalOpen}
                    onClose={() => setIsAddExistingDocumentModalOpen(false)}
                    personId={person.person_id}
                    onDocumentAssociated={() => {
                        // Refresh person details to get updated documents
                        const fetchPersonDetails = async () => {
                            try {
                                const personData = await projectsApi.getPersonById(person.person_id, {
                                    includeDocuments: true
                                });

                                if (personData.documents) {
                                    setDocuments(personData.documents);
                                }
                            } catch (err) {
                                console.error('Error refreshing person documents:', err);
                            }
                        };

                        fetchPersonDetails();
                    }}
                />
            </div>
        </div>
    );
};

export default EditPersonModal;
