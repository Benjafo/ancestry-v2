import React, { useEffect, useState } from 'react';
import { ProjectDetail, UserEvent, projectsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';

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
        } catch (err) {
            console.error('Error fetching research notes:', err);
            setError('Failed to load research notes');
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
        } catch (err) {
            console.error('Error adding research note:', err);
            setError('Failed to add research note');
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setIsSubmitting(false);
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
                                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{note.message}</p>
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
        </div>
    );
};

export default ProjectResearchNotesTab;
