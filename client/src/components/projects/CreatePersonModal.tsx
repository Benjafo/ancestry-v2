import React, { useState } from 'react';
import { Person, projectsApi } from '../../api/client';

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
    
    const [projectNotes, setProjectNotes] = useState('');
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
            // Create the person
            const { message, person } = await projectsApi.createPerson(formData);
            
            // If projectId is provided, add the person to the project
            if (projectId) {
                await projectsApi.addPersonToProject(projectId, person.person_id, projectNotes);
            }
            
            onPersonCreated(person);
            onClose();
        } catch (err: any) {
            console.error('Error creating person:', err);
            setError(err.message || 'Failed to create person');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Create New Person
                </h2>
                
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
                                Gender
                            </label>
                            <select
                                name="gender"
                                className="form-select w-full dark:bg-gray-700 dark:text-white"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Birth Date
                            </label>
                            <input
                                type="date"
                                name="birth_date"
                                className="form-input w-full dark:bg-gray-700 dark:text-white"
                                value={formData.birth_date}
                                onChange={handleChange}
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
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Person'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePersonModal;
