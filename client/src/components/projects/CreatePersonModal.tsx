import React, { useState } from 'react';
import { Person, projectsApi } from '../../api/client';
import { getApiErrorMessage } from '../../utils/errorUtils';
import {
    validateGender,
    validateLengthRange,
    validatePersonDates,
    validateRequired
} from '../../utils/formValidation'; // Import validation utilities
import BaseModal from '../common/BaseModal'; // Import BaseModal
import ErrorAlert from '../common/ErrorAlert';

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
        let currentError: string | undefined;

        currentError = validateRequired(formData.first_name, 'First name');
        if (currentError) { setError(currentError); return false; }
        currentError = validateLengthRange(formData.first_name, 1, 100, 'First name');
        if (currentError) { setError(currentError); return false; }

        currentError = validateRequired(formData.last_name, 'Last name');
        if (currentError) { setError(currentError); return false; }
        currentError = validateLengthRange(formData.last_name, 1, 100, 'Last name');
        if (currentError) { setError(currentError); return false; }

        currentError = validateGender(formData.gender);
        if (currentError) { setError(currentError); return false; }

        currentError = validatePersonDates(formData.birth_date, formData.death_date);
        if (currentError) { setError(currentError); return false; }

        setError(null); // Clear any previous errors if all validations pass
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
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error creating person:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Person" size="4xl">
            {/* Error state */}
            {error && <ErrorAlert message={error} />}

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
        </BaseModal>
    );
};

export default CreatePersonModal;
