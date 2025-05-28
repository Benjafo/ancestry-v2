import { useState } from 'react';
import { managerApi } from '../api/client';
import BaseModal from './common/BaseModal'; // Import BaseModal
import {
    validateEmail,
    validatePasswordStrength,
    validateRequired,
    validateLengthRange,
    validateRole
} from '../utils/formValidation'; // Import validation utilities

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
        // Clear error for the field being changed
        setFormErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        let error = validateEmail(formData.email);
        if (error) errors.email = error;

        error = validatePasswordStrength(formData.password);
        if (error) errors.password = error;

        error = validateRequired(formData.first_name, 'First name');
        if (error) errors.first_name = error;
        error = validateLengthRange(formData.first_name, 2, 50, 'First name');
        if (error) errors.first_name = error;

        error = validateRequired(formData.last_name, 'Last name');
        if (error) errors.last_name = error;
        error = validateLengthRange(formData.last_name, 2, 50, 'Last name');
        if (error) errors.last_name = error;

        error = validateRole(formData.role);
        if (error) errors.role = error;

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
