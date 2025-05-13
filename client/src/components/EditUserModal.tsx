import { useState } from 'react';
import { UserDetails, managerApi } from '../api/client';

interface EditUserModalProps {
    isOpen: boolean;
    user: UserDetails;
    onClose: () => void;
    onSuccess: (message: string) => void;
    onResetPassword: (userId: string) => void;
}

const EditUserModal = ({ isOpen, user, onClose, onSuccess, onResetPassword }: EditUserModalProps) => {
    const [formData, setFormData] = useState({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.roles[0] || 'client'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Form handling functions
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.first_name) {
            errors.first_name = 'First name is required';
        }
        
        if (!formData.last_name) {
            errors.last_name = 'Last name is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            await managerApi.updateUser(user.user_id, formData);
            onSuccess('User updated successfully');
            onClose();
        } catch (err) {
            console.error('Error updating user:', err);
            setFormErrors({ submit: 'Failed to update user. Please try again.' });
        }
    };

    const handleDeactivateUser = async () => {
        try {
            await managerApi.deactivateUser(user.user_id);
            onSuccess('User deactivated successfully');
            onClose();
        } catch (err) {
            console.error('Error deactivating user:', err);
            setFormErrors({ submit: 'Failed to deactivate user. Please try again.' });
        }
    };

    const handleReactivateUser = async () => {
        try {
            await managerApi.reactivateUser(user.user_id);
            onSuccess('User reactivated successfully');
            onClose();
        } catch (err) {
            console.error('Error reactivating user:', err);
            setFormErrors({ submit: 'Failed to reactivate user. Please try again.' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Edit User</h2>
                    <button
                        className="text-gray-400 hover:text-gray-500"
                        onClick={onClose}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleUpdateUser}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700"
                                value={formData.email}
                                disabled
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                        </div>
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                className={`form-input mt-1 block w-full rounded-md ${formErrors.first_name ? 'border-red-300' : ''}`}
                                value={formData.first_name}
                                onChange={handleInputChange}
                            />
                            {formErrors.first_name && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                className={`form-input mt-1 block w-full rounded-md ${formErrors.last_name ? 'border-red-300' : ''}`}
                                value={formData.last_name}
                                onChange={handleInputChange}
                            />
                            {formErrors.last_name && (
                                <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="form-select mt-1 block w-full rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.role}
                                onChange={handleInputChange}
                            >
                                <option value="client">Client</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                        {formErrors.submit && (
                            <p className="text-sm text-red-600">{formErrors.submit}</p>
                        )}
                    </div>

                    <hr className="my-6 border-gray-200 dark:border-gray-700" />
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Account Actions</h3>
                            <div className="mt-3 flex flex-col space-y-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 text-left"
                                    onClick={() => {
                                        onResetPassword(user.user_id);
                                        onClose();
                                    }}
                                >
                                    Reset Password
                                </button>
                                
                                {user.is_active ? (
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800 text-left"
                                        onClick={handleDeactivateUser}
                                    >
                                        Deactivate User
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800 text-left"
                                        onClick={handleReactivateUser}
                                    >
                                        Reactivate User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            Update User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
