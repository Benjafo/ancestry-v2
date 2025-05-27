import React, { useEffect, useState } from 'react';
import { ApiRelationship, ProjectDetail, relationshipsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import EmptyState from '../common/EmptyState';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import ViewToggle from '../common/ViewToggle';
import AddRelationshipModal from './AddRelationshipModal';
import EditRelationshipModal from './EditRelationshipModal';

interface ProjectRelationshipsTabProps {
    project: ProjectDetail;
    onViewPerson: (personId: string) => void;
}

const ProjectRelationshipsTab: React.FC<ProjectRelationshipsTabProps> = ({ project, onViewPerson }) => {
    // State for relationships data
    const [relationships, setRelationships] = useState<ApiRelationship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('projectRelationshipsViewMode') as 'grid' | 'list') || 'list';
    });
    const [sortBy, setSortBy] = useState<string>('created_at'); // Default sort by created date
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default sort order descending

    const handleToggleView = (newView: 'grid' | 'list') => {
        setViewMode(newView);
        localStorage.setItem('projectRelationshipsViewMode', newView);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [newSortBy, newSortOrder] = e.target.value.split(':');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    };

    // State for modal visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRelationship, setEditingRelationship] = useState<ApiRelationship | null>(null);
    const [deletingRelationshipId, setDeletingRelationshipId] = useState<string | null>(null);

    // State to track which relationship is being hovered
    const [hoveredRelationshipId, setHoveredRelationshipId] = useState<string | null>(null);

    // Fetch relationships for the current project
    useEffect(() => {
        const fetchRelationships = async () => {
            try {
                setIsLoading(true);
                // Fetch the full ApiRelationship data with sorting
                const data: ApiRelationship[] = await relationshipsApi.getRelationshipsByProjectId(project.id, {
                    sortBy,
                    sortOrder
                });
                console.log('Fetched relationships:', data);
                setRelationships(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching relationships:', err);
                setError('Failed to load relationships');
                setIsLoading(false);
            }
        };

        fetchRelationships();
    }, [project.id, sortBy, sortOrder]);

    // Handler for opening the add relationship modal
    const handleAddRelationship = () => {
        setIsAddModalOpen(true);
    };

    // Handler for editing a relationship
    const handleEditRelationship = (relationship: ApiRelationship) => {
        setEditingRelationship(relationship);
    };

    // Handler for deleting a relationship
    const handleDeleteRelationship = (relationshipId: string) => {
        setDeletingRelationshipId(relationshipId);
    };

    const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
    const listClasses = "divide-y divide-gray-200 dark:divide-gray-700";

    const relationshipItemClasses = viewMode === 'grid'
        ? "border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 relative"
        : "";

    return (
        <div>
            <div>
                {/* Enhanced header with better spacing and visual hierarchy */}
                <div className="mb-6">
                    {/* Top row: Title and Add Relationship button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Family Relationships</h3>

                        <div className="flex items-center gap-3">
                            <ViewToggle currentView={viewMode} onToggle={handleToggleView} />

                            <select
                                id="sort-relationships"
                                name="sort-relationships"
                                className="form-select pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-48"
                                value={`${sortBy}:${sortOrder}`}
                                onChange={handleSortChange}
                            >
                                <option value="created_at:desc">Created Date (Newest)</option>
                                <option value="created_at:asc">Created Date (Oldest)</option>
                                <option value="updated_at:desc">Last Updated (Newest)</option>
                                <option value="updated_at:asc">Last Updated (Oldest)</option>
                                <option value="relationship_type:asc">Relationship Type (A-Z)</option>
                                <option value="relationship_type:desc">Relationship Type (Z-A)</option>
                                <option value="start_date:desc">Start Date (Newest)</option>
                                <option value="start_date:asc">Start Date (Oldest)</option>
                                <option value="end_date:desc">End Date (Newest)</option>
                                <option value="end_date:asc">End Date (Oldest)</option>
                            </select>

                            {project.access_level === 'edit' && project.status !== 'completed' && (
                                <button
                                    className="btn-primary"
                                    onClick={handleAddRelationship}
                                >
                                    Add Relationship
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Second row: View toggle and Sort dropdown */}

                </div>
            </div>
            {/* Loading state */}
            {
                isLoading ? (
                    <LoadingSpinner containerClassName="h-32" size="md" />
                ) : error ? (
                    <ErrorAlert message={error} />
                ) : relationships.length === 0 ? (
                    <EmptyState message="No relationships have been defined for this project yet." />
                ) : (
                    <div className={viewMode === 'grid' ? "" : "overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md"}>
                        <ul className={viewMode === 'grid' ? gridClasses : listClasses}>
                            {relationships.map((relationship: ApiRelationship) => (
                                <li
                                    key={relationship.relationship_id}
                                    className={relationshipItemClasses}
                                >
                                    {viewMode === 'grid' ? (
                                        <div
                                            className="cursor-pointer relative"
                                            onMouseEnter={() => {
                                                setHoveredRelationshipId(relationship.relationship_id);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredRelationshipId(null);
                                            }}
                                        >
                                            {/* Grid view hover buttons */}
                                            {project.access_level === 'edit' && project.status !== 'completed' && (
                                                <div className={`absolute top-2 right-2 flex space-x-2 transition-opacity duration-200 ${hoveredRelationshipId === relationship.relationship_id ? 'opacity-100' : 'opacity-0'}`}>
                                                    <button
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditRelationship(relationship);
                                                        }}
                                                        title="Edit relationship"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteRelationship(relationship.relationship_id);
                                                        }}
                                                        title="Delete relationship"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex flex-col items-center text-center">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    <button
                                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:underline cursor-pointer font-medium"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (relationship.person1?.person_id) {
                                                                onViewPerson(relationship.person1.person_id);
                                                            }
                                                        }}
                                                    >
                                                        {relationship.person1?.first_name} {relationship.person1?.last_name}
                                                    </button> <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">is</span>
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white text-md">
                                                    {relationship.relationship_qualifier ? `${relationship.relationship_qualifier} ` : ''}
                                                    {relationship.relationship_type}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">of </span>
                                                    <button
                                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:underline cursor-pointer font-medium"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (relationship.person2?.person_id) {
                                                                onViewPerson(relationship.person2.person_id);
                                                            }
                                                        }}
                                                    >
                                                        {relationship.person2?.first_name} {relationship.person2?.last_name}
                                                    </button>
                                                </span>
                                            </div>

                                            {(relationship.start_date || relationship.end_date) && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                                                    {relationship.start_date && (
                                                        <span>From: {formatDate(relationship.start_date)}</span>
                                                    )}
                                                    {relationship.start_date && relationship.end_date && (
                                                        <span className="mx-1">-</span>
                                                    )}
                                                    {relationship.end_date && (
                                                        <span>To: {formatDate(relationship.end_date)}</span>
                                                    )}
                                                </div>
                                            )}

                                            {relationship.notes && (
                                                <div className="mt-2 text-sm text-center">
                                                    <p className="font-medium">Notes:</p>
                                                    <p className="text-gray-600 dark:text-gray-300">{relationship.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className="block hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative"
                                            onMouseEnter={() => {
                                                setHoveredRelationshipId(relationship.relationship_id);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredRelationshipId(null);
                                            }}
                                        >
                                            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center flex-wrap">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            <button
                                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:underline cursor-pointer font-medium"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (relationship.person1?.person_id) {
                                                                        onViewPerson(relationship.person1.person_id);
                                                                    }
                                                                }}
                                                            >
                                                                {relationship.person1?.first_name} {relationship.person1?.last_name}
                                                            </button> <span className="text-gray-500 dark:text-gray-400 font-normal">is</span>
                                                        </span>
                                                        <span className="mx-2 font-medium text-gray-900 dark:text-white text-md">
                                                            {relationship.relationship_qualifier ? `${relationship.relationship_qualifier} ` : ''}
                                                            {relationship.relationship_type}
                                                        </span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            <span className="text-gray-500 dark:text-gray-400 font-normal">of </span>
                                                            <button
                                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 hover:underline cursor-pointer font-medium"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (relationship.person2?.person_id) {
                                                                        onViewPerson(relationship.person2.person_id);
                                                                    }
                                                                }}
                                                            >
                                                                {relationship.person2?.first_name} {relationship.person2?.last_name}
                                                            </button>
                                                        </span>
                                                    </div>

                                                    {(relationship.start_date || relationship.end_date) && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {relationship.start_date && (
                                                                <span>From: {formatDate(relationship.start_date)}</span>
                                                            )}
                                                            {relationship.start_date && relationship.end_date && (
                                                                <span className="mx-2">-</span>
                                                            )}
                                                            {relationship.end_date && (
                                                                <span>To: {formatDate(relationship.end_date)}</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {relationship.notes && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                            <span className="font-medium">Notes:</span> {relationship.notes}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center">
                                                    {/* Edit/Delete buttons - only visible on hover */}
                                                    {project.access_level === 'edit' && project.status !== 'completed' && (
                                                        <div className={`flex space-x-2 mr-4 transition-opacity duration-200 ${hoveredRelationshipId === relationship.relationship_id ? 'opacity-100' : 'opacity-0'}`}>
                                                            <button
                                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditRelationship(relationship);
                                                                }}
                                                                title="Edit relationship"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteRelationship(relationship.relationship_id);
                                                                }}
                                                                title="Delete relationship"
                                                            >
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }

            {/* Add Relationship Modal */}
            {
                isAddModalOpen && (
                    <AddRelationshipModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onRelationshipAdded={() => {
                            // Refresh relationships after adding
                            const fetchRelationships = async () => {
                                try {
                                    setIsLoading(true);
                                    const data = await relationshipsApi.getRelationshipsByProjectId(project.id);
                                    setRelationships(data);
                                    setIsLoading(false);
                                } catch (err) {
                                    console.error('Error fetching relationships:', err);
                                    setError('Failed to load relationships');
                                    setIsLoading(false);
                                }
                            };
                            fetchRelationships();
                        }}
                        projectId={project.id}
                        persons={project.persons || []}
                        relationships={relationships}
                    />
                )
            }

            {/* Edit Relationship Modal */}
            {
                editingRelationship && (
                    <EditRelationshipModal
                        isOpen={!!editingRelationship}
                        onClose={() => setEditingRelationship(null)}
                        onRelationshipUpdated={() => {
                            // Refresh relationships after updating
                            const fetchRelationships = async () => {
                                try {
                                    setIsLoading(true);
                                    const data = await relationshipsApi.getRelationshipsByProjectId(project.id);
                                    setRelationships(data);
                                    setIsLoading(false);
                                } catch (err) {
                                    console.error('Error fetching relationships:', err);
                                    setError('Failed to load relationships');
                                }
                            };
                            fetchRelationships();
                        }}
                        relationshipId={editingRelationship.relationship_id}
                        relationship={editingRelationship}
                    />
                )
            }

            {/* Delete Relationship Confirmation Modal */}
            {
                deletingRelationshipId && (
                    <ConfirmDeleteModal
                        isOpen={!!deletingRelationshipId}
                        onClose={() => setDeletingRelationshipId(null)}
                        onConfirm={async () => {
                            try {
                                await relationshipsApi.deleteRelationship(deletingRelationshipId);

                                // Remove the relationship from the state
                                setRelationships(relationships.filter(r => r.relationship_id !== deletingRelationshipId));

                                // Close the modal
                                setDeletingRelationshipId(null);
                            } catch (err) {
                                console.error('Error deleting relationship:', err);
                                setError('Failed to delete relationship');
                            }
                        }}
                        title="Delete Relationship"
                        message="Are you sure you want to delete this relationship? This action cannot be undone."
                    />
                )
            }
        </div >
    );
};

export default ProjectRelationshipsTab;
