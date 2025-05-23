import React, { useState } from 'react';
import { ApiError, Person, projectsApi } from '../../api/client';
import BaseModal from '../common/BaseModal'; // Import BaseModal
import ErrorAlert from '../common/ErrorAlert'; // Import ErrorAlert

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
        } catch (err: unknown) {
            console.error('Error updating person notes:', err);
            const error = err as ApiError;
            setError(error.message || 'Failed to update person notes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title={`Edit Notes for ${person.first_name} ${person.last_name}`}>
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

                {error && <ErrorAlert message={error} />}

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
        </BaseModal>
    );
};

export default EditPersonNotesModal;
