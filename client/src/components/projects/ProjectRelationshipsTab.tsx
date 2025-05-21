import React, { useEffect, useState } from 'react';
import { ProjectDetail, relationshipsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import EmptyState from '../common/EmptyState';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import AddRelationshipModal from './AddRelationshipModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditRelationshipModal from './EditRelationshipModal';

interface ProjectRelationshipsTabProps {
    project: ProjectDetail;
}

const ProjectRelationshipsTab: React.FC<ProjectRelationshipsTabProps> = ({ project }) => {
    // State for relationships data
    const [relationships, setRelationships] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for modal visibility
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRelationship, setEditingRelationship] = useState<any | null>(null);
    const [deletingRelationshipId, setDeletingRelationshipId] = useState<string | null>(null);

    // Fetch relationships for the current project
    useEffect(() => {
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
    }, [project.id]);

    // Handler for opening the add relationship modal
    const handleAddRelationship = () => {
        setIsAddModalOpen(true);
    };

    // Handler for editing a relationship
    const handleEditRelationship = (relationship: any) => {
        setEditingRelationship(relationship);
    };

    // Handler for deleting a relationship
    const handleDeleteRelationship = (relationshipId: string) => {
        setDeletingRelationshipId(relationshipId);
    };

    return (
        <div className="space-y-6">
            {/* Header with Add button */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Family Relationships</h3>
                {project.access_level === 'edit' && project.status !== 'completed' && (
                    <button
                        className="btn-primary"
                        onClick={handleAddRelationship}
                    >
                        Add Relationship
                    </button>
                )}
            </div>

            {/* Loading state */}
            {isLoading ? (
                <LoadingSpinner containerClassName="h-32" size="md" />
            ) : error ? (
                <ErrorAlert message={error} />
            ) : relationships.length === 0 ? (
                <EmptyState message="No relationships have been defined for this project yet." />
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {relationships.map((relationship) => (
                            <li key={relationship.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {relationship.person1Name}
                                            </span>
                                            <span className="mx-2 text-gray-500 dark:text-gray-400">is</span>
                                            <span className="font-medium text-primary-600 dark:text-primary-400">
                                                {relationship.qualifier ? `${relationship.qualifier} ` : ''}
                                                {relationship.type}
                                            </span>
                                            <span className="mx-2 text-gray-500 dark:text-gray-400">of</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {relationship.person2Name}
                                            </span>
                                        </div>

                                        {(relationship.startDate || relationship.endDate) && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {relationship.startDate && (
                                                    <span>From: {formatDate(relationship.startDate)}</span>
                                                )}
                                                {relationship.startDate && relationship.endDate && (
                                                    <span className="mx-2">-</span>
                                                )}
                                                {relationship.endDate && (
                                                    <span>To: {formatDate(relationship.endDate)}</span>
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
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Add Relationship Modal */}
            {isAddModalOpen && (
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
            )}

            {/* Edit Relationship Modal */}
            {editingRelationship && (
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
            )}

            {/* Delete Relationship Confirmation Modal */}
            {deletingRelationshipId && (
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
            )}
        </div>
    );
};

export default ProjectRelationshipsTab;
