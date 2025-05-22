import React, { useState } from 'react';
import { ApiError, Person, projectsApi } from '../../api/client';

interface CreatePersonModalProps {
    projectId?: string; // Optional: if provided, will add the person to this project
    isOpen: boolean;
    onClose: () => void;
    onPersonCreated: (person: Person) => void;
}

const CreatePersonModal: React.FC<CreatePersonModalProps> = ({
    projectId,
    isOpen,
    onClose,
    onPersonCreated
}) => {
    // Basic person info state
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        maiden_name: '',
        gender: '',
        birth_date: '',
        birth_location: '',
        death_date: '',
        death_location: '',
        notes: ''
    });

    // Project-specific notes (if adding to a project)
    const [projectNotes, setProjectNotes] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            setError('First name is required');
            return false;
        }

        if (!formData.last_name.trim()) {
            setError('Last name is required');
            return false;
        }

        if (!formData.gender) {
            setError('Gender is required');
            return false;
        }

        if (!formData.birth_date) {
            setError('Birth date is required');
            return false;
        }

        // Check if death date is after birth date if both are provided
        if (formData.birth_date && formData.death_date) {
            const birthDate = new Date(formData.birth_date);
            const deathDate = new Date(formData.death_date);

            if (deathDate < birthDate) {
                setError('Death date cannot be before birth date');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare form data - only include fields with values to avoid validation errors
            const cleanedFormData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                gender: formData.gender,
                birth_date: formData.birth_date,
                // Only include optional fields if they have values
                ...(formData.middle_name ? { middle_name: formData.middle_name } : {}),
                ...(formData.maiden_name ? { maiden_name: formData.maiden_name } : {}),
                ...(formData.birth_location ? { birth_location: formData.birth_location } : {}),
                ...(formData.death_date ? { death_date: formData.death_date } : {}),
                ...(formData.death_location ? { death_location: formData.death_location } : {}),
                ...(formData.notes ? { notes: formData.notes } : {})
            };

            // Create the person with biographical information only
            const person = await projectsApi.createPerson(cleanedFormData);

            // If projectId is provided, add the person to the project
            if (projectId) {
                await projectsApi.addPersonToProject(projectId, person.person_id, projectNotes);
            }

            // Fetch the updated person
            const refreshedPerson = await projectsApi.getPersonById(person.person_id);

            onPersonCreated(refreshedPerson);
            onClose();
        } catch (err: unknown) {
            console.error('Error creating person:', err);
            const error = err as ApiError;
            setError(error.message || 'Failed to create person');
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create New Person
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error state */}
                {error && (
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

                {/* Biographical Information Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Middle Name
                                    </label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.middle_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Maiden Name
                                    </label>
                                    <input
                                        type="text"
                                        name="maiden_name"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.maiden_name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        name="gender"
                                        className="form-select w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="unknown">Unknown</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Birth Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.birth_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Birth Location
                                    </label>
                                    <input
                                        type="text"
                                        name="birth_location"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.birth_location}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Death Date
                                    </label>
                                    <input
                                        type="date"
                                        name="death_date"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.death_date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Death Location
                                    </label>
                                    <input
                                        type="text"
                                        name="death_location"
                                        className="form-input w-full dark:bg-gray-700 dark:text-white"
                                        value={formData.death_location}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                                    rows={4}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Add any additional notes about this person..."
                                />
                            </div>

                            {projectId && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Project-Specific Notes
                                    </label>
                                    <textarea
                                        className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        value={projectNotes}
                                        onChange={(e) => setProjectNotes(e.target.value)}
                                        placeholder="Add notes about this person's role in the project..."
                                    />
                                </div>
                            )}
                </form>

                {/* Footer with action buttons */}
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Person'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePersonModal;
