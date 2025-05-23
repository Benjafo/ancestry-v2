import React, { useEffect, useState } from 'react';
import { ApiRelationship, relationshipsApi } from '../../api/client';
import { getApiErrorMessage } from '../../utils/errorUtils';
import BaseModal from '../common/BaseModal'; // Import BaseModal
import ErrorAlert from '../common/ErrorAlert'; // Import ErrorAlert

interface EditRelationshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRelationshipUpdated: () => void;
    relationshipId: string;
    relationship: ApiRelationship;
}

const EditRelationshipModal: React.FC<EditRelationshipModalProps> = ({
    isOpen,
    onClose,
    onRelationshipUpdated,
    relationshipId,
    relationship
}) => {
    // Form state
    const [formData, setFormData] = useState({
        relationshipType: '',
        relationshipQualifier: '',
        startDate: '',
        endDate: '',
        notes: ''
    });

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize form data when relationship changes
    useEffect(() => {
        if (relationship) {
            setFormData({
                relationshipType: relationship.relationship_type || '',
                relationshipQualifier: relationship.relationship_qualifier || '',
                startDate: relationship.start_date || '',
                endDate: relationship.end_date || '',
                notes: relationship.notes || ''
            });
        }
    }, [relationship]);

    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Form validation
    const validateForm = () => {
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
            await relationshipsApi.updateRelationship(relationshipId, {
                relationship_type: formData.relationshipType,
                relationship_qualifier: formData.relationshipQualifier || undefined,
                start_date: formData.startDate || undefined,
                end_date: formData.endDate || undefined,
                notes: formData.notes || undefined
            });

            // Call the callback to refresh relationships
            onRelationshipUpdated();

            // Close the modal
            onClose();
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error updating relationship:', errorMessage);

            // Format specific error messages to be more user-friendly
            let displayMessage = errorMessage;
            if (errorMessage.includes('validation failed')) {
                displayMessage = `Validation error: ${errorMessage.split('validation failed:')[1]?.trim() || 'Please check your inputs.'}`;
            } else if (errorMessage.includes('not found')) {
                displayMessage = `The relationship could not be found. It may have been deleted. Please refresh and try again.`;
            } else if (errorMessage.includes('Marriage validation failed')) {
                displayMessage = `Marriage validation error: ${errorMessage.split('Marriage validation failed:')[1]?.trim() || 'Please check the marriage details.'}`;
            } else if (errorMessage.includes('Circular relationship')) {
                displayMessage = `This relationship would create a circular family tree, which is not allowed.`;
            } else if (errorMessage.includes('is not a valid qualifier')) {
                displayMessage = `The selected qualifier is not valid for this relationship type. Please choose a different qualifier.`;
            }

            setError(displayMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Relationship" size="lg">
            {/* Error message */}
            {error && <ErrorAlert message={error} />}

            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Display persons (read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Person 1
                        </label>
                        <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {relationship.person1?.first_name} {relationship.person1?.last_name}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Person 2
                        </label>
                        <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {relationship.person2?.first_name} {relationship.person2?.last_name}
                        </div>
                    </div>

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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default EditRelationshipModal;
