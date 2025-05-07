import React, { useState } from 'react';
import { Person, projectsApi } from '../../api/client';

interface EditPersonNotesModalProps {
    projectId: string;
    person: Person;
    isOpen: boolean;
    onClose: () => void;
    onNotesUpdated: () => void;
}

const EditPersonNotesModal: React.FC<EditPersonNotesModalProps> = ({ 
    projectId, 
    person, 
    isOpen, 
    onClose, 
    onNotesUpdated 
}) => {
    const [notes, setNotes] = useState(person.project_persons?.notes || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            await projectsApi.updateProjectPerson(projectId, person.person_id, notes);
            onNotesUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error updating person notes:', err);
            setError(err.message || 'Failed to update person notes');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Edit Notes for {person.first_name} {person.last_name}
                </h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                            rows={5}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this person's role in the project..."
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-red-500 text-sm">{error}</div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPersonNotesModal;
