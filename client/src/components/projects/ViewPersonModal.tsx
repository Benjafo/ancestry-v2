import React, { useEffect, useState } from 'react';
import { Person, Relationship, projectsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import DocumentList from '../documents/DocumentList';

interface ViewPersonModalProps {
    personId: string;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (person: Person) => void; // Optional callback for edit button
    onViewRelatedPerson?: (personId: string) => void; // Optional callback for viewing related persons
    projectStatus?: 'active' | 'completed' | 'on_hold';
    isManager?: boolean;
}

const ViewPersonModal: React.FC<ViewPersonModalProps> = ({
    personId,
    isOpen,
    onClose,
    onEdit,
    onViewRelatedPerson,
    projectStatus,
    isManager
}) => {
    const [person, setPerson] = useState<Person | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'events' | 'documents' | 'relationships'>('info');

    // No need for document viewing state as DocumentList handles this internally

    // Function to format event type for display
    const formatEventType = (eventType: string): string => {
        if (!eventType) return '';

        // Convert snake_case or kebab-case to spaces
        const formatted = eventType.replace(/[_-]/g, ' ');

        // Capitalize each word
        return formatted
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        if (isOpen && personId) {
            fetchPersonDetails();
        }
    }, [personId, isOpen]);

    // Function to organize relationships from relationshipsAsSubject and relationshipsAsObject
    const organizeRelationships = (personData: Person) => {
        const organizedRelationships = {
            parents: [] as Relationship[],
            children: [] as Relationship[],
            spouses: [] as Relationship[],
            siblings: [] as Relationship[]
        };

        // Process relationships where this person is the subject (person1)
        if (personData.relationshipsAsSubject && personData.relationshipsAsSubject.length > 0) {
            personData.relationshipsAsSubject.forEach(rel => {
                if (rel.person2) {
                    const person = {
                        person_id: rel.person2.person_id,
                        first_name: rel.person2.first_name,
                        last_name: rel.person2.last_name,
                        relationship_qualifier: rel.relationship_qualifier,
                        start_date: rel.start_date,
                        end_date: rel.end_date
                    };

                    if (rel.relationship_type === 'parent') {
                        organizedRelationships.children.push(person);
                    } else if (rel.relationship_type === 'spouse') {
                        organizedRelationships.spouses.push(person);
                    } else if (rel.relationship_type === 'sibling') {
                        organizedRelationships.siblings.push(person);
                    }
                }
            });
        }

        // Process relationships where this person is the object (person2)
        if (personData.relationshipsAsObject && personData.relationshipsAsObject.length > 0) {
            personData.relationshipsAsObject.forEach(rel => {
                if (rel.person1) {
                    const person = {
                        person_id: rel.person1.person_id,
                        first_name: rel.person1.first_name,
                        last_name: rel.person1.last_name,
                        relationship_qualifier: rel.relationship_qualifier,
                        start_date: rel.start_date,
                        end_date: rel.end_date
                    };

                    if (rel.relationship_type === 'parent') {
                        organizedRelationships.parents.push(person);
                    } else if (rel.relationship_type === 'spouse') {
                        organizedRelationships.spouses.push(person);
                    } else if (rel.relationship_type === 'sibling') {
                        organizedRelationships.siblings.push(person);
                    }
                }
            });
        }

        return organizedRelationships;
    };

    const fetchPersonDetails = async () => {
        setLoading(true);
        try {
            // Fetch person with all related data
            const personData = await projectsApi.getPersonById(personId, {
                includeEvents: true,
                includeDocuments: true,
                includeRelationships: true
            });

            // Process relationships if they exist in the new format
            if ((personData.relationshipsAsSubject && personData.relationshipsAsSubject.length > 0) ||
                (personData.relationshipsAsObject && personData.relationshipsAsObject.length > 0)) {

                const organizedRelationships = organizeRelationships(personData);

                // Update the person data with the organized relationships
                personData.relationships = organizedRelationships;
            }

            setPerson(personData);
        } catch (err) {
            console.error('Error fetching person details:', err);
            setError('Failed to load person details');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal header with close button */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {loading ? 'Loading...' : person ? `${person.first_name} ${person.last_name}` : 'Person Details'}
                    </h2>
                    <div className="flex items-center space-x-2">
                        {!loading && person && onEdit && projectStatus !== 'completed' && isManager && (
                            <button
                                onClick={() => {
                                    onEdit(person);
                                    onClose(); // Close the view modal when edit is clicked
                                }}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Edit Person"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                        {!loading && person && projectStatus === 'completed' && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                Read-only
                            </span>
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
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
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

                {/* Person data */}
                {!loading && person && (
                    <>
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

                        {/* Tab content */}
                        <div>
                            {/* Biographical Info Tab */}
                            {activeTab === 'info' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                                                <p className="text-gray-900 dark:text-white">
                                                    {person.first_name} {person.middle_name ? `${person.middle_name} ` : ''}{person.last_name}
                                                </p>
                                            </div>
                                            {person.maiden_name && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maiden Name</p>
                                                    <p className="text-gray-900 dark:text-white">{person.maiden_name}</p>
                                                </div>
                                            )}
                                            {person.gender && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                                                    <p className="text-gray-900 dark:text-white capitalize">{person.gender}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Life Events</h3>
                                        <div className="space-y-3">
                                            {person.birth_date && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Birth Date</p>
                                                    <p className="text-gray-900 dark:text-white">{formatDate(person.birth_date)}</p>
                                                </div>
                                            )}
                                            {person.birth_location && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Birth Location</p>
                                                    <p className="text-gray-900 dark:text-white">{person.birth_location}</p>
                                                </div>
                                            )}
                                            {person.death_date && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Death Date</p>
                                                    <p className="text-gray-900 dark:text-white">{formatDate(person.death_date)}</p>
                                                </div>
                                            )}
                                            {person.death_location && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Death Location</p>
                                                    <p className="text-gray-900 dark:text-white">{person.death_location}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {person.notes && (
                                        <div className="col-span-1 md:col-span-2">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Notes</h3>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{person.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Events Tab */}
                            {activeTab === 'events' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Events</h3>
                                    {person.events && person.events.length > 0 ? (
                                        <div className="flow-root">
                                            <ul className="-mb-8">
                                                {person.events.map((event, eventIdx) => (
                                                    <li key={event.event_id}>
                                                        <div className="relative pb-8">
                                                            {eventIdx !== (person.events?.length || 0) - 1 ? (
                                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                                                            ) : null}
                                                            <div className="relative flex space-x-3">
                                                                <div>
                                                                    <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                                                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatEventType(event.event_type)}</p>
                                                                        {event.description && (
                                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                                                                        )}
                                                                        {event.event_location && (
                                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{event.event_location}</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                                        <time dateTime={event.event_date}>{formatDate(event.event_date)}</time>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 dark:text-gray-400">No events found for this person.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documents</h3>
                                    {person.documents && person.documents.length > 0 ? (
                                        <DocumentList
                                            personId={person.person_id}
                                            documents={person.documents}
                                            isLoading={false}
                                            error={null}
                                            readOnly={true}
                                        />
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 dark:text-gray-400">No documents found for this person.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Relationships Tab */}
                            {activeTab === 'relationships' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Relationships</h3>

                                    {person.relationships && Object.keys(person.relationships).length > 0 ? (
                                        <div className="space-y-6">
                                            {/* Spouses */}
                                            {person.relationships.spouses && person.relationships.spouses.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Spouses</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {person.relationships.spouses.map(spouse => (
                                                            <div
                                                                key={spouse.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(spouse.person_id);
                                                                    }
                                                                }}
                                                            >
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
                                            {person.relationships.parents && person.relationships.parents.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parents</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {person.relationships.parents.map(parent => (
                                                            <div
                                                                key={parent.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(parent.person_id);
                                                                    }
                                                                }}
                                                            >
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
                                            {person.relationships.children && person.relationships.children.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Children</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {person.relationships.children.map(child => (
                                                            <div
                                                                key={child.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(child.person_id);
                                                                    }
                                                                }}
                                                            >
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
                                            {person.relationships.siblings && person.relationships.siblings.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Siblings</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {person.relationships.siblings.map(sibling => (
                                                            <div
                                                                key={sibling.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(sibling.person_id);
                                                                    }
                                                                }}
                                                            >
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
                                            {(person.relationships).grandparents && (person.relationships).grandparents.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grandparents</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(person.relationships).grandparents.map((grandparent) => (
                                                            <div
                                                                key={grandparent.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(grandparent.person_id);
                                                                    }
                                                                }}
                                                            >
                                                                <p className="font-medium text-gray-900 dark:text-white">{grandparent.first_name} {grandparent.last_name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Grandchildren */}
                                            {(person.relationships).grandchildren && (person.relationships).grandchildren.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grandchildren</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(person.relationships).grandchildren.map((grandchild) => (
                                                            <div
                                                                key={grandchild.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(grandchild.person_id);
                                                                    }
                                                                }}
                                                            >
                                                                <p className="font-medium text-gray-900 dark:text-white">{grandchild.first_name} {grandchild.last_name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Aunts/Uncles */}
                                            {(person.relationships).auntsUncles && (person.relationships).auntsUncles.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aunts & Uncles</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(person.relationships).auntsUncles.map((auntUncle) => (
                                                            <div
                                                                key={auntUncle.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(auntUncle.person_id);
                                                                    }
                                                                }}
                                                            >
                                                                <p className="font-medium text-gray-900 dark:text-white">{auntUncle.first_name} {auntUncle.last_name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Nieces/Nephews */}
                                            {(person.relationships).niecesNephews && (person.relationships).niecesNephews.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nieces & Nephews</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(person.relationships).niecesNephews.map((nieceNephew) => (
                                                            <div
                                                                key={nieceNephew.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(nieceNephew.person_id);
                                                                    }
                                                                }}
                                                            >
                                                                <p className="font-medium text-gray-900 dark:text-white">{nieceNephew.first_name} {nieceNephew.last_name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cousins */}
                                            {(person.relationships).cousins && (person.relationships).cousins.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cousins</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(person.relationships).cousins.map((cousin) => (
                                                            <div
                                                                key={cousin.person_id}
                                                                className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onViewRelatedPerson) {
                                                                        onViewRelatedPerson(cousin.person_id);
                                                                    }
                                                                }}
                                                            >
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
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ViewPersonModal;
