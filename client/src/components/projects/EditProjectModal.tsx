import { useState } from 'react';
import { Project, projectsApi } from '../../api/client';
import { getApiErrorMessage } from '../../utils/errorUtils';
import BaseModal from '../common/BaseModal'; // Import BaseModal

interface EditProjectModalProps<T extends Project = Project> {
    project: T;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedProject: T) => void;
}

const EditProjectModal = <T extends Project = Project>({ 
    project, 
    isOpen, 
    onClose, 
    onSuccess 
}: EditProjectModalProps<T>) => {
    const [formData, setFormData] = useState({
        title: project.title,
        description: project.description,
        status: project.status as 'active' | 'completed' | 'on_hold'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.title.trim()) {
            errors.title = 'Project title is required';
        }
        
        if (!formData.description.trim()) {
            errors.description = 'Project description is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // If project is completed, only send status
            const dataToSend = project.status === 'completed' 
                ? { status: formData.status } 
                : formData;
                
            const response = await projectsApi.updateProject(project.id, dataToSend);
            // Cast the response to the same type as the input project
            onSuccess({ ...project, ...response.project } as T);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error updating project:', errorMessage);
            setFormErrors({ submit: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Project">
            <form onSubmit={handleUpdateProject}>
                <div className="space-y-4">
                    {project.status === 'completed' && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            <p className="text-sm">
                                This project is marked as completed. You can only change its status.
                            </p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Project Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className={`form-input mt-1 block w-full rounded-md ${project.status === 'completed' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${formErrors.title ? 'border-red-300 dark:border-red-500' : ''}`}
                            value={formData.title}
                            onChange={handleInputChange}
                            disabled={project.status === 'completed'}
                        />
                        {formErrors.title && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            className={`form-input mt-1 block w-full rounded-md ${project.status === 'completed' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${formErrors.description ? 'border-red-300 dark:border-red-500' : ''}`}
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={project.status === 'completed'}
                        />
                        {formErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            className="form-select mt-1 block w-full rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                        </select>
                    </div>
                    {formErrors.submit && (
                        <p className="text-sm text-red-600">{formErrors.submit}</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
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
                        {isSubmitting ? 'Updating...' : 'Update Project'}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default EditProjectModal;
