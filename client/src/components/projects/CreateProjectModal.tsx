import { useState } from 'react';
import { Project, projectsApi } from '../../api/client';
import { getApiErrorMessage } from '../../utils/errorUtils';
import ErrorAlert from '../common/ErrorAlert';
import BaseModal from '../common/BaseModal'; // Import BaseModal

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (project: Project) => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Project title is required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const response = await projectsApi.createProject({
                title,
                description
            });

            onSuccess(response.project);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error creating project:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Create New Project">
            <form onSubmit={handleSubmit} className="p-6">
                {error && <ErrorAlert message={error} />}

                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-input w-full rounded-md"
                        placeholder="Enter project title"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-textarea w-full rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        rows={4}
                        placeholder="Enter project description"
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
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
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            'Create Project'
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default CreateProjectModal;
