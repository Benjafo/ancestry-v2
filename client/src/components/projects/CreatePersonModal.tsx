import React, { useState } from 'react';
import { ApiError, Document, Event, Person, documentsApi, eventsApi, projectsApi } from '../../api/client';
import DocumentForm from '../documents/DocumentForm';
import EventForm from '../events/EventForm';

interface CreatePersonModalProps {
    projectId?: string; // Optional: if provided, will add the person to this project
    isOpen: boolean;
    onClose: () => void;
    onPersonCreated: (person: Person) => void;
}

const CreatePersonModal: React.FC<CreatePersonModalProps> = ({ 
    projectId, 
    isOpen, 
    onClose, 
    onPersonCreated 
}) => {
    // Tab state
    const [activeTab, setActiveTab] = useState<'info' | 'events' | 'documents' | 'relationships'>('info');
    
    // Basic person info state
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        maiden_name: '',
        gender: '',
        birth_date: '',
        birth_location: '',
        death_date: '',
        death_location: '',
        notes: ''
    });
    
    // Project-specific notes (if adding to a project)
    const [projectNotes, setProjectNotes] = useState('');
    
    // Events state
    const [events, setEvents] = useState<Partial<Event>[]>([]);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);
    
    // Documents state
    const [documents, setDocuments] = useState<Partial<Document>[]>([]);
    const [isAddingDocument, setIsAddingDocument] = useState(false);
    const [editingDocumentIndex, setEditingDocumentIndex] = useState<number | null>(null);
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            // Step 1: Create the person
            const { person } = await projectsApi.createPerson(formData);
            
            // Step 2: Create events for this person
            for (const eventData of events) {
                await eventsApi.createEvent({
                    ...eventData,
                    person_id: person.person_id
                });
            }
            
            // Step 3: Create documents and associate them
            for (const docData of documents) {
                const { document } = await documentsApi.createDocument(docData);
                await documentsApi.associateDocumentWithPerson(
                    document.document_id, 
                    person.person_id
                );
            }
            
            // Step 4: If projectId is provided, add the person to the project
            if (projectId) {
                await projectsApi.addPersonToProject(projectId, person.person_id, projectNotes);
            }
            
            // Fetch the updated person with all related data
            const refreshedPerson = await projectsApi.getPersonById(person.person_id, {
                includeEvents: true,
                includeDocuments: true,
                includeRelationships: true
            });
            
            onPersonCreated(refreshedPerson);
            onClose();
        } catch (err: unknown) {
            console.error('Error creating person:', err);
            const error = err as ApiError;
            setError(error.message || 'Failed to create person');
        } finally {
            setLoading(false);
        }
    };

    // Event handlers
    const handleAddEvent = () => {
        setIsAddingEvent(true);
    };

    const handleEditEvent = (index: number) => {
        setEditingEventIndex(index);
    };

    const handleDeleteEvent = (index: number) => {
        setEvents(events.filter((_, i) => i !== index));
    };

    const handleEventSaved = (event: Event) => {
        if (editingEventIndex !== null) {
            // Update existing event
            const updatedEvents = [...events];
            updatedEvents[editingEventIndex] = event;
            setEvents(updatedEvents);
            setEditingEventIndex(null);
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

    const handleEditDocument = (index: number) => {
        setEditingDocumentIndex(index);
    };

    const handleDeleteDocument = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index));
    };

    const handleDocumentSaved = (document: Document) => {
        if (editingDocumentIndex !== null) {
            // Update existing document
            const updatedDocuments = [...documents];
            updatedDocuments[editingDocumentIndex] = document;
            setDocuments(updatedDocuments);
            setEditingDocumentIndex(null);
        } else {
            // Add new document
            setDocuments([...documents, document]);
            setIsAddingDocument(false);
        }
    };

    // Custom event and document components for creating new items
    const NewEventsList = () => {
        if (events.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No events added yet.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Click the "Add Event" button to add events to this person.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {events.map((event, index) => (
                    <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{event.event_type}</h4>
                                {event.event_date && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Date: {new Date(event.event_date).toLocaleDateString()}
                                    </p>
                                )}
                                {event.event_location && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Location: {event.event_location}
                                    </p>
                                )}
                                {event.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditEvent(index)}
                                    className="text-primary-600 hover:text-primary-900"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteEvent(index)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const NewDocumentsList = () => {
        if (documents.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No documents added yet.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Click the "Add Document" button to add documents to this person.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {documents.map((doc, index) => (
                    <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{doc.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Type: {doc.document_type}
                                </p>
                                {doc.source && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Source: {doc.source}
                                    </p>
                                )}
                                {doc.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                        {doc.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleEditDocument(index)}
                                    className="text-primary-600 hover:text-primary-900"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteDocument(index)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create New Person
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
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'info'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('info')}
                        >
                            Biographical Info
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'events'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('events')}
                        >
                            Events
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'documents'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('documents')}
                        >
                            Documents
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'relationships'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('relationships')}
                        >
                            Relationships
                        </button>
                    </nav>
                </div>
                
                {/* Error state */}
                {error && (
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
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        className="form-select w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Birth Date
                                    </label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.birth_date}
                                        onChange={handleChange}
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
                            
                            {projectId && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project-Specific Notes
                                    </label>
                                    <textarea
                                        className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        value={projectNotes}
                                        onChange={(e) => setProjectNotes(e.target.value)}
                                        placeholder="Add notes about this person's role in the project..."
                                    />
                                </div>
                            )}
                        </form>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div>
                            {isAddingEvent || editingEventIndex !== null ? (
                                <EventForm
                                    onSuccess={handleEventSaved}
                                    onCancel={() => {
                                        setIsAddingEvent(false);
                                        setEditingEventIndex(null);
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
                                    
                                    <NewEventsList />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div>
                            {isAddingDocument || editingDocumentIndex !== null ? (
                                <DocumentForm
                                    onSuccess={handleDocumentSaved}
                                    onCancel={() => {
                                        setIsAddingDocument(false);
                                        setEditingDocumentIndex(null);
                                    }}
                                />
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={handleAddDocument}
                                        >
                                            Add Document
                                        </button>
                                    </div>
                                    
                                    <NewDocumentsList />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Relationships Tab (Read-only) */}
                    {activeTab === 'relationships' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relationships</h3>
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">Relationships can be added after creating the person.</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    You'll be able to add parents, children, spouses, and siblings from the Relationships management section.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
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
                        {loading ? 'Creating...' : 'Create Person'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePersonModal;
