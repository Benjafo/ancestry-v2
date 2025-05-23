import { useState } from 'react';
import { managerApi } from '../api/client';
import BaseModal from './common/BaseModal'; // Import BaseModal

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (userId?: string) => void;
    defaultRole?: 'client' | 'manager';
}

const CreateUserModal = ({ isOpen, onClose, onSuccess, defaultRole = 'client' }: CreateUserModalProps) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: defaultRole
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        // Email validation
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // First name validation
        if (!formData.first_name) {
            errors.first_name = 'First name is required';
        } else if (formData.first_name.length < 2 || formData.first_name.length > 50) {
            errors.first_name = 'First name must be between 2 and 50 characters';
        }

        // Last name validation
        if (!formData.last_name) {
            errors.last_name = 'Last name is required';
        } else if (formData.last_name.length < 2 || formData.last_name.length > 50) {
            errors.last_name = 'Last name must be between 2 and 50 characters';
        }

        // Role validation
        if (!formData.role) {
            errors.role = 'Role is required';
        } else if (!['client', 'manager'].includes(formData.role)) {
            errors.role = 'Role must be either "client" or "manager"';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await managerApi.createUser(formData);
            onSuccess(response.user?.user_id);
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                role: defaultRole
            });
        } catch (err: unknown) {
            console.error('Error creating user:', err);
            setFormErrors({ submit: 'Failed to create user. Please try again.' });
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Create New User">
            <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`form-input mt-1 block w-full rounded-md ${formErrors.email ? 'border-red-300' : ''}`}
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`form-input mt-1 block w-full rounded-md ${formErrors.password ? 'border-red-300' : ''}`}
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                        </p>
                        {formErrors.password && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                        )}
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
                        Create User
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default CreateUserModal;
