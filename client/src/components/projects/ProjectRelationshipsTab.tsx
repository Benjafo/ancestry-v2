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
}

const ProjectRelationshipsTab: React.FC<ProjectRelationshipsTabProps> = ({ project }) => {
    // State for relationships data
    const [relationships, setRelationships] = useState<ApiRelationship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('projectRelationshipsViewMode') as 'grid' | 'list') || 'list';
    });

    const handleToggleView = (newView: 'grid' | 'list') => {
        setViewMode(newView);
        localStorage.setItem('projectRelationshipsViewMode', newView);
    };

    // State for modal visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRelationship, setEditingRelationship] = useState<ApiRelationship | null>(null);
    const [deletingRelationshipId, setDeletingRelationshipId] = useState<string | null>(null);

    // Fetch relationships for the current project
    useEffect(() => {
        const fetchRelationships = async () => {
            try {
                setIsLoading(true);
                // Fetch the full ApiRelationship data
                const data: ApiRelationship[] = await relationshipsApi.getRelationshipsByProjectId(project.id);
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
    }, [project.id]);

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
        <div className="space-y-6">
            {/* Header with Add button and View Toggle */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Family Relationships</h3>
                <div className="flex space-x-2">
                    {project.access_level === 'edit' && project.status !== 'completed' && (
                        <button
                            className="btn-primary"
                            onClick={handleAddRelationship}
                        >
                            Add Relationship
                        </button>
                    )}
                    <ViewToggle currentView={viewMode} onToggle={handleToggleView} />
                </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
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
                                key={relationship.id}
                                className={relationshipItemClasses}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {relationship.person1?.first_name} {relationship.person1?.last_name} <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">is</span>
                                            </span>
                                            <span className="font-medium text-primary-600 dark:text-primary-400 text-lg">
                                                {relationship.relationship_qualifier ? `${relationship.relationship_qualifier} ` : ''}
                                                {relationship.relationship_type}
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">of </span>{relationship.person2?.first_name} {relationship.person2?.last_name}
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

                                        {project.access_level === 'edit' && project.status !== 'completed' && (
                                            <div className="flex justify-center space-x-2 mt-4">
                                                <button
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                    onClick={() => handleEditRelationship(relationship)}
                                                    title="Edit relationship"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleDeleteRelationship(relationship.id)}
                                                    title="Delete relationship"
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="block hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative">
                                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center flex-wrap">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {relationship.person1?.first_name} {relationship.person1?.last_name} <span className="text-gray-500 dark:text-gray-400 font-normal">is</span>
                                                    </span>
                                                    <span className="mx-2 font-medium text-primary-600 dark:text-primary-400">
                                                        {relationship.relationship_qualifier ? `${relationship.relationship_qualifier} ` : ''}
                                                        {relationship.relationship_type}
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        <span className="text-gray-500 dark:text-gray-400 font-normal">of </span>{relationship.person2?.first_name} {relationship.person2?.last_name}
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

                                            {/* Edit/Delete buttons */}
                                            {project.access_level === 'edit' && project.status !== 'completed' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                        onClick={() => handleEditRelationship(relationship)}
                                                        title="Edit relationship"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleDeleteRelationship(relationship.id)}
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
                                    setIsLoading(false);
                                }
                            };
                            fetchRelationships();
                        }}
                        relationshipId={editingRelationship.id}
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
                                setRelationships(relationships.filter(r => r.id !== deletingRelationshipId));

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
