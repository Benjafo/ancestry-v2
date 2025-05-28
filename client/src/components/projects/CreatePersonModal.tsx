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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the field being changed
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        let error = validateRequired(formData.first_name, 'First name');
        if (error) errors.first_name = error;
        error = validateLengthRange(formData.first_name, 1, 100, 'First name');
        if (error && !errors.first_name) errors.first_name = error; // Only set if not already set by required

        error = validateRequired(formData.last_name, 'Last name');
        if (error) errors.last_name = error;
        error = validateLengthRange(formData.last_name, 1, 100, 'Last name');
        if (error && !errors.last_name) errors.last_name = error; // Only set if not already set by required

        error = validateGender(formData.gender);
        if (error) errors.gender = error;

        // Birth date is required, death date is optional
        if (!formData.birth_date) {
            errors.birth_date = 'Birth date is required';
        } else {
            error = validatePersonDates(formData.birth_date, formData.death_date);
            if (error) {
                // This validation returns a single error for both dates.
                // We need to parse it or decide how to display it.
                // For now, we'll put it under a generic 'dates' key or the first relevant field.
                if (error.includes('Birth date')) errors.birth_date = error;
                else if (error.includes('Death date')) errors.death_date = error;
                else errors.birth_date = error; // Fallback
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setFormErrors({}); // Clear all errors on successful validation attempt

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
            setFormErrors({ submit: errorMessage }); // Set a general submit error
        } finally {
            setLoading(false);
        }
    };


    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Person" size="4xl">
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
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.first_name ? 'border-red-300' : ''}`}
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />
                        {formErrors.first_name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Middle Name
                        </label>
                        <input
                            type="text"
                            name="middle_name"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.middle_name ? 'border-red-300' : ''}`}
                            value={formData.middle_name}
                            onChange={handleChange}
                        />
                        {formErrors.middle_name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.middle_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.last_name ? 'border-red-300' : ''}`}
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                        {formErrors.last_name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Maiden Name
                        </label>
                        <input
                            type="text"
                            name="maiden_name"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.maiden_name ? 'border-red-300' : ''}`}
                            value={formData.maiden_name}
                            onChange={handleChange}
                        />
                        {formErrors.maiden_name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.maiden_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Gender *
                        </label>
                        <select
                            name="gender"
                            className={`form-select w-full dark:bg-gray-700 dark:text-white ${formErrors.gender ? 'border-red-300' : ''}`}
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
                        {formErrors.gender && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Birth Date *
                        </label>
                        <input
                            type="date"
                            name="birth_date"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.birth_date ? 'border-red-300' : ''}`}
                            value={formData.birth_date}
                            onChange={handleChange}
                            required
                        />
                        {formErrors.birth_date && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.birth_date}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Birth Location
                        </label>
                        <input
                            type="text"
                            name="birth_location"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.birth_location ? 'border-red-300' : ''}`}
                            value={formData.birth_location}
                            onChange={handleChange}
                        />
                        {formErrors.birth_location && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.birth_location}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Death Date
                        </label>
                        <input
                            type="date"
                            name="death_date"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.death_date ? 'border-red-300' : ''}`}
                            value={formData.death_date}
                            onChange={handleChange}
                        />
                        {formErrors.death_date && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.death_date}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Death Location
                        </label>
                        <input
                            type="text"
                            name="death_location"
                            className={`form-input w-full dark:bg-gray-700 dark:text-white ${formErrors.death_location ? 'border-red-300' : ''}`}
                            value={formData.death_location}
                            onChange={handleChange}
                        />
                        {formErrors.death_location && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.death_location}</p>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        name="notes"
                        className={`form-textarea w-full dark:bg-gray-700 dark:text-white ${formErrors.notes ? 'border-red-300' : ''}`}
                        rows={4}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Add any additional notes about this person..."
                    />
                    {formErrors.notes && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
                    )}
                </div>

                {projectId && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project-Specific Notes
                        </label>
                        <textarea
                            className={`form-textarea w-full dark:bg-gray-700 dark:text-white ${formErrors.projectNotes ? 'border-red-300' : ''}`}
                            rows={3}
                            value={projectNotes}
                            onChange={(e) => setProjectNotes(e.target.value)}
                            placeholder="Add notes about this person's role in the project..."
                        />
                        {formErrors.projectNotes && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.projectNotes}</p>
                        )}
                    </div>
                )}

                {formErrors.submit && (
                    <p className="text-sm text-red-600">{formErrors.submit}</p>
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
