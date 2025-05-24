import React, { useEffect, useState } from 'react';
import { ProjectDetail, UserEvent, projectsApi } from '../../api/client';
import { User } from '../../utils/auth';
import { formatDate } from '../../utils/dateUtils';
import EmptyState from '../common/EmptyState';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDeleteNoteModal from '../common/ConfirmDeleteNoteModal';
import { getApiErrorMessage } from '../../utils/errorUtils';

interface ProjectResearchNotesTabProps {
    project: ProjectDetail;
}

const ProjectResearchNotesTab: React.FC<ProjectResearchNotesTabProps> = ({ project }) => {
    const [researchNotes, setResearchNotes] = useState<UserEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for edit and delete functionality
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editNoteText, setEditNoteText] = useState('');
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    // Check if user is a manager
    const currentUser: User = JSON.parse(localStorage.getItem('user') || '{}');
    const isManager = currentUser?.roles?.includes('manager');

    // Fetch research notes
    const fetchResearchNotes = async () => {
        try {
            setIsLoading(true);
            const data = await projectsApi.getProjectEvents(project.id, {
                sortBy: 'createdAt',
                sortOrder: 'desc',
                eventType: 'research_milestone'
            });
            setResearchNotes(data.events);
            setIsLoading(false);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error fetching research notes:', errorMessage);
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResearchNotes();
    }, [project.id]);

    // Add a new research note
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newNote.trim()) return;

        try {
            setIsSubmitting(true);

            // Call the API to add a research note
            await projectsApi.addResearchNote(project.id, newNote);

            // Show success message
            setSuccessMessage('Research note added successfully');

            // Clear the input
            setNewNote('');

            // Refresh the notes list
            fetchResearchNotes();

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error adding research note:', errorMessage);
            setError(errorMessage);

            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Start editing a note
    const handleStartEdit = (note: UserEvent) => {
        setEditingNoteId(note.id);
        setEditNoteText(note.message);
    };

    // Cancel editing a note
    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditNoteText('');
    };

    // Save edited note
    const handleSaveEdit = async (noteId: string) => {
        if (!editNoteText.trim()) return;

        try {
            setIsEditSubmitting(true);

            // Call the API to update the note
            await projectsApi.updateResearchNote(noteId, editNoteText);

            // Show success message
            setSuccessMessage('Research note updated successfully');

            // Clear edit state
            setEditingNoteId(null);
            setEditNoteText('');

            // Refresh the notes list
            fetchResearchNotes();

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error updating research note:', errorMessage);
            setError(errorMessage);

            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setIsEditSubmitting(false);
        }
    };

    // Open delete confirmation
    const handleOpenDeleteConfirm = (noteId: string) => {
        setDeleteNoteId(noteId);
        setIsDeleteConfirmOpen(true);
    };

    // Delete a note
    const handleDeleteNote = async () => {
        if (!deleteNoteId) return;

        try {
            // Call the API to delete the note
            await projectsApi.deleteResearchNote(deleteNoteId);

            // Show success message
            setSuccessMessage('Research note deleted successfully');

            // Clear delete state
            setDeleteNoteId(null);

            // Refresh the notes list
            fetchResearchNotes();

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error deleting research note:', errorMessage);
            setError(errorMessage);

            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Success message */}
            {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
                    <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
                </div>
            )}

            {/* Research notes list */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Research Notes</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        A chronological record of research findings and milestones
                    </p>
                </div>

                {/* Add new note form - inline version */}
                {project.access_level === 'edit' && project.status !== 'completed' && (
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleAddNote} className="flex items-center space-x-2">
                            <input
                                type="text"
                                id="newNote"
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Add a research note..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                className="btn-primary whitespace-nowrap"
                                disabled={isSubmitting || !newNote.trim()}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Note'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="px-4 py-5 sm:p-6">
                    {isLoading ? (
                        <LoadingSpinner containerClassName="h-32" size="md" />
                    ) : error ? (
                        <ErrorAlert message={error} />
                    ) : researchNotes.length === 0 ? (
                        <EmptyState message="No research notes have been added to this project yet." />
                    ) : (
                        <div className="space-y-6">
                            {researchNotes.map((note) => (
                                <div key={note.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                                    {editingNoteId === note.id ? (
                                        // Edit form
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                                value={editNoteText}
                                                onChange={(e) => setEditNoteText(e.target.value)}
                                                disabled={isEditSubmitting}
                                            />
                                            <div className="flex justify-end mt-2 space-x-2">
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                    onClick={handleCancelEdit}
                                                    disabled={isEditSubmitting}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    onClick={() => handleSaveEdit(note.id)}
                                                    disabled={isEditSubmitting || !editNoteText.trim()}
                                                >
                                                    {isEditSubmitting ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Note content
                                        <div className="group relative">
                                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap pr-16">{note.message}</p>

                                            {/* Edit/Delete buttons - only visible to managers or if project is editable */}
                                            {(isManager || (project.access_level === 'edit' && project.status !== 'completed')) && (
                                                <div className="absolute top-0 right-0 hidden group-hover:flex space-x-2">
                                                    <button
                                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                        onClick={() => handleStartEdit(note)}
                                                        title="Edit note"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleOpenDeleteConfirm(note.id)}
                                                        title="Delete note"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(note.createdAt)}
                                        </span>
                                        {note.actor && (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Added by {note.actor.first_name} {note.actor.last_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation modal */}
            <ConfirmDeleteNoteModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteNote}
            />
        </div>
    );
};

export default ProjectResearchNotesTab;
