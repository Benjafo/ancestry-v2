import React, { useState } from 'react';
import { Person, relationshipsApi } from '../../api/client';

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
}

const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({
    isOpen,
    onClose,
    onRelationshipAdded,
    projectId,
    persons
}) => {
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
        if (!formData.person1Id) {
            setError('Person 1 is required');
            return false;
        }

        if (!formData.person2Id) {
            setError('Person 2 is required');
            return false;
        }

        if (formData.person1Id === formData.person2Id) {
            setError('Person 1 and Person 2 cannot be the same');
            return false;
        }

        if (!formData.relationshipType) {
            setError('Relationship type is required');
            return false;
        }

        // Validate dates if both are provided
        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
            
            if (endDate < startDate) {
                setError('End date cannot be before start date');
                return false;
            }
        }

        // Validate that marriage relationships have a start date
        if (formData.relationshipType === 'spouse' && !formData.startDate) {
            setError('Marriage date (start date) is required for spouse relationships');
            return false;
        }

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
        } catch (err: any) {
            console.error('Error creating relationship:', err);
            setError(err.message || 'Failed to create relationship');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Add Relationship
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

                {/* Error message */}
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
                                <option value="child">Child</option>
                                <option value="spouse">Spouse</option>
                                <option value="sibling">Sibling</option>
                                <option value="grandparent">Grandparent</option>
                                <option value="grandchild">Grandchild</option>
                                <option value="aunt/uncle">Aunt/Uncle</option>
                                <option value="niece/nephew">Niece/Nephew</option>
                                <option value="cousin">Cousin</option>
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
            </div>
        </div>
    );
};

export default AddRelationshipModal;
