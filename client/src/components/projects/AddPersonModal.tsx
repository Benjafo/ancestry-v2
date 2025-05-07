import React, { useState } from 'react';
import { Person, projectsApi } from '../../api/client';
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
        } catch (err: any) {
            console.error('Error adding person to project:', err);
            setError(err.message || 'Failed to add person to project');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Person to Project</h2>
                
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
                                {selectedPerson.birth_date && `Born: ${new Date(selectedPerson.birth_date).toLocaleDateString()}`}
                                {selectedPerson.birth_date && selectedPerson.death_date && ' - '}
                                {selectedPerson.death_date && `Died: ${new Date(selectedPerson.death_date).toLocaleDateString()}`}
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
                            disabled={!selectedPerson || loading}
                        >
                            {loading ? 'Adding...' : 'Add Person'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPersonModal;
