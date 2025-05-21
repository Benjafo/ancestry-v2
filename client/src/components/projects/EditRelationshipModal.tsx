import React, { useEffect, useState } from 'react';
import { relationshipsApi } from '../../api/client';

interface EditRelationshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRelationshipUpdated: () => void;
    relationshipId: string;
    relationship: {
        id: string;
        person1Id: string;
        person2Id: string;
        person1Name: string;
        person2Name: string;
        type: string;
        qualifier?: string;
        startDate?: string;
        endDate?: string;
        notes?: string;
    };
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
                relationshipType: relationship.type || '',
                relationshipQualifier: relationship.qualifier || '',
                startDate: relationship.startDate || '',
                endDate: relationship.endDate || '',
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
        } catch (err: any) {
            console.error('Error updating relationship:', err);

            // Extract and format the error message from the server response
            let errorMessage = 'Failed to update relationship';

            try {
                // For Ky errors, the response is available in err.response
                if (err.response) {
                    // Clone the response to read it multiple times if needed
                    const clonedResponse = err.response.clone();

                    try {
                        // Try to parse as JSON first
                        const jsonData = await clonedResponse.json();
                        if (jsonData && jsonData.message) {
                            errorMessage = jsonData.message;
                        }
                    } catch (jsonError) {
                        console.error('Error parsing JSON response:', jsonError);

                        // If JSON parsing fails, try to get the text
                        const textData = await err.response.text();
                        if (textData) {
                            // Try to extract a message from the text
                            const messageMatch = textData.match(/"message"\s*:\s*"([^"]+)"/);
                            if (messageMatch && messageMatch[1]) {
                                errorMessage = messageMatch[1];
                            } else {
                                errorMessage = textData;
                            }
                        }
                    }
                } else if (err.name === 'HTTPError') {
                    // For Ky HTTPError, try to extract the message from the error object
                    const errorText = err.toString();
                    // Extract the specific error message if possible
                    const messageMatch = errorText.match(/message":"([^"]+)"/);
                    if (messageMatch && messageMatch[1]) {
                        errorMessage = messageMatch[1];
                    } else {
                        errorMessage = errorText;
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
            } catch (extractError) {
                console.error('Error extracting error message:', extractError);
                // If all else fails, use the original error message
                errorMessage = err.message || errorMessage;
            }

            // Format specific error messages to be more user-friendly
            if (errorMessage.includes('validation failed')) {
                errorMessage = `Validation error: ${errorMessage.split('validation failed:')[1]?.trim() || 'Please check your inputs.'}`;
            } else if (errorMessage.includes('not found')) {
                errorMessage = `The relationship could not be found. It may have been deleted. Please refresh and try again.`;
            } else if (errorMessage.includes('Marriage validation failed')) {
                errorMessage = `Marriage validation error: ${errorMessage.split('Marriage validation failed:')[1]?.trim() || 'Please check the marriage details.'}`;
            } else if (errorMessage.includes('Circular relationship')) {
                errorMessage = `This relationship would create a circular family tree, which is not allowed.`;
            } else if (errorMessage.includes('is not a valid qualifier')) {
                errorMessage = `The selected qualifier is not valid for this relationship type. Please choose a different qualifier.`;
            }

            setError(errorMessage);
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
                        Edit Relationship
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
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 mb-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Validation Error</h3>
                                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Display persons (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Person 1
                            </label>
                            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {relationship.person1Name}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Person 2
                            </label>
                            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {relationship.person2Name}
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
            </div>
        </div>
    );
};

export default EditRelationshipModal;
