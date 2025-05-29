import React, { useState } from 'react';
import { Person, Relationship, relationshipsApi } from '../../api/client';
import { getApiErrorMessage } from '../../utils/errorUtils';
import {
    validateRelationship,
    validateRelationshipDates,
    validateRequired
} from '../../utils/formValidation'; // Import validation utilities
import BaseModal from '../common/BaseModal'; // Import BaseModal
import ErrorAlert from '../common/ErrorAlert'; // Import ErrorAlert

interface PersonSelectorProps {
    label: string;
    persons: Person[];
    selectedPersonId: string;
    onChange: (personId: string) => void;
    required?: boolean;
}

// PersonSelector component for selecting a person from a dropdown
const PersonSelector: React.FC<PersonSelectorProps> = ({
    label,
    persons,
    selectedPersonId,
    onChange,
    required = false
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                className="form-select w-full dark:bg-gray-700 dark:text-white"
                value={selectedPersonId}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            >
                <option value="">Select a person</option>
                {persons.map((person) => (
                    <option key={person.person_id} value={person.person_id}>
                        {person.first_name} {person.last_name}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface AddRelationshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRelationshipAdded: () => void;
    projectId: string;
    persons: Person[];
    relationships?: Relationship[]; // Existing relationships in the project
}

const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({
    isOpen,
    onClose,
    onRelationshipAdded,
    projectId,
    persons,
    relationships = []
}) => {
    console.log('Logging to avoid unused error (oops, sorry)', projectId);

    // Form state
    const [formData, setFormData] = useState({
        person1Id: '',
        person2Id: '',
        relationshipType: '',
        relationshipQualifier: '',
        startDate: '',
        endDate: '',
        notes: ''
    });

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle person selection
    const handlePerson1Change = (personId: string) => {
        setFormData((prev) => ({ ...prev, person1Id: personId }));
    };

    const handlePerson2Change = (personId: string) => {
        setFormData((prev) => ({ ...prev, person2Id: personId }));
    };

    // Form validation
    const validateForm = () => {
        let currentError: string | undefined;

        currentError = validateRequired(formData.person1Id, 'Person 1');
        if (currentError) { setError(currentError); return false; }

        currentError = validateRequired(formData.person2Id, 'Person 2');
        if (currentError) { setError(currentError); return false; }

        currentError = validateRelationship(formData.person1Id, formData.person2Id, formData.relationshipType, relationships);
        if (currentError) { setError(currentError); return false; }

        currentError = validateRequired(formData.relationshipType, 'Relationship type');
        if (currentError) { setError(currentError); return false; }

        currentError = validateRelationshipDates(formData.startDate, formData.endDate, formData.relationshipType);
        if (currentError) { setError(currentError); return false; }

        setError(null); // Clear any previous errors if all validations pass
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await relationshipsApi.createRelationship({
                person1_id: formData.person1Id,
                person2_id: formData.person2Id,
                relationship_type: formData.relationshipType,
                relationship_qualifier: formData.relationshipQualifier || undefined,
                start_date: formData.startDate || undefined,
                end_date: formData.endDate || undefined,
                notes: formData.notes || undefined
            });

            // Call the callback to refresh relationships
            onRelationshipAdded();

            // Close the modal
            onClose();
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error creating relationship:', errorMessage);

            // Format specific error messages to be more user-friendly
            let displayMessage = errorMessage;
            if (errorMessage.includes('already exists between these people')) {
                displayMessage = `A relationship of this type already exists between these people. Please choose different people or a different relationship type.`;
            } else if (errorMessage.includes('validation failed')) {
                displayMessage = `Validation error: ${errorMessage.split('validation failed:')[1]?.trim() || 'Please check your inputs.'}`;
            } else if (errorMessage.includes('not found')) {
                displayMessage = `One or both of the selected people could not be found. Please refresh and try again.`;
            } else if (errorMessage.includes('Circular relationship')) {
                displayMessage = `This relationship would create a circular family tree, which is not allowed.`;
            }

            setError(displayMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Add Relationship" size="lg">
            {/* Error message */}
            {error && <ErrorAlert message={error} />}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Person selectors */}
                    <PersonSelector
                        label="Person 1"
                        persons={persons}
                        selectedPersonId={formData.person1Id}
                        onChange={handlePerson1Change}
                        required
                    />

                    <PersonSelector
                        label="Person 2"
                        persons={persons}
                        selectedPersonId={formData.person2Id}
                        onChange={handlePerson2Change}
                        required
                    />

                    {/* Relationship type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Relationship Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="relationshipType"
                            className="form-select w-full dark:bg-gray-700 dark:text-white"
                            value={formData.relationshipType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Relationship Type</option>
                            <option value="parent">Parent</option>
                            <option value="spouse">Spouse</option>
                        </select>
                    </div>

                    {/* Relationship qualifier */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Relationship Qualifier
                        </label>
                        <select
                            name="relationshipQualifier"
                            className="form-select w-full dark:bg-gray-700 dark:text-white"
                            value={formData.relationshipQualifier}
                            onChange={handleChange}
                        >
                            <option value="">None</option>
                            <option value="biological">Biological</option>
                            <option value="adoptive">Adoptive</option>
                            <option value="step">Step</option>
                            <option value="foster">Foster</option>
                            <option value="in-law">In-law</option>
                        </select>
                    </div>

                    {/* Start date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date {formData.relationshipType === 'spouse' && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                            value={formData.startDate}
                            onChange={handleChange}
                            required={formData.relationshipType === 'spouse'}
                        />
                    </div>

                    {/* End date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            className="form-input w-full dark:bg-gray-700 dark:text-white"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            className="form-textarea w-full dark:bg-gray-700 dark:text-white"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Add any additional notes about this relationship..."
                        />
                    </div>
                </div>

                {/* Form actions */}
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Relationship'}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default AddRelationshipModal;
