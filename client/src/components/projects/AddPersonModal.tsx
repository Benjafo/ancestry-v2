import React, { useState } from 'react';
import { Person, projectsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import { getApiErrorMessage } from '../../utils/errorUtils';
import BaseModal from '../common/BaseModal';
import ErrorAlert from '../common/ErrorAlert';
import PersonSelector from './PersonSelector';

interface AddPersonModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onPersonAdded: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ projectId, isOpen, onClose, onPersonAdded }) => {
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPerson) return;

        setLoading(true);
        setError(null);

        try {
            await projectsApi.addPersonToProject(projectId, selectedPerson.person_id, notes);
            onPersonAdded();
            onClose();
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error adding person to project:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Add Person to Project">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search for a Person
                    </label>
                    <PersonSelector onSelect={setSelectedPerson} />
                </div>

                {selectedPerson && (
                    <div className="mb-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-medium text-gray-900 dark:text-white">{selectedPerson.first_name} {selectedPerson.last_name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedPerson.birth_date && `Born: ${formatDate(selectedPerson.birth_date)}`}
                            {selectedPerson.birth_date && selectedPerson.death_date && ' - '}
                            {selectedPerson.death_date && `Died: ${formatDate(selectedPerson.death_date)}`}
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                        rows={3}
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
                        disabled={!selectedPerson || loading}
                    >
                        {loading ? 'Adding...' : 'Add Person'}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default AddPersonModal;
