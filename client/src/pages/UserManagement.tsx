import { useEffect, useState } from 'react';
import { UserDetails, managerApi } from '../api/client';

const UserManagement = () => {
    const [users, setUsers] = useState<UserDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'clients' | 'managers'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'client'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await managerApi.getUsers(filter);
            setUsers(response.users);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        
        if (isCreateModalOpen && !formData.password) {
            errors.password = 'Password is required';
        } else if (isCreateModalOpen && formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
        
        if (!formData.first_name) {
            errors.first_name = 'First name is required';
        }
        
        if (!formData.last_name) {
            errors.last_name = 'Last name is required';
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
            /* const response = */ await managerApi.createUser(formData);
            setSuccessMessage('User created successfully');
            setIsCreateModalOpen(false);
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                role: 'client'
            });
            fetchUsers();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error creating user:', err);
            setFormErrors({ submit: 'Failed to create user. Please try again.' });
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm() || !selectedUser) {
            return;
        }
        
        try {
            const { /* password, */ ...updateData } = formData;
            /* const response = */ await managerApi.updateUser(selectedUser.user_id, updateData);
            setSuccessMessage('User updated successfully');
            setIsEditModalOpen(false);
            fetchUsers();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error updating user:', err);
            setFormErrors({ submit: 'Failed to update user. Please try again.' });
        }
    };

    const handleDeactivateUser = async (userId: string) => {
        try {
            await managerApi.deactivateUser(userId);
            setSuccessMessage('User deactivated successfully');
            fetchUsers();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error deactivating user:', err);
            setError('Failed to deactivate user');
        }
    };

    const handleReactivateUser = async (userId: string) => {
        try {
            await managerApi.reactivateUser(userId);
            setSuccessMessage('User reactivated successfully');
            fetchUsers();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error reactivating user:', err);
            setError('Failed to reactivate user');
        }
    };

    const handleResetPassword = async (userId: string) => {
        try {
            const response = await managerApi.resetUserPassword(userId);
            setTemporaryPassword(response.temporaryPassword);
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('Failed to reset password');
        }
    };

    const openEditModal = (user: UserDetails) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '',
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.roles[0] || 'client'
        });
        setIsEditModalOpen(true);
    };

    const filteredUsers = users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            user.first_name.toLowerCase().includes(searchTermLower) ||
            user.last_name.toLowerCase().includes(searchTermLower) ||
            user.email.toLowerCase().includes(searchTermLower)
        );
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                <button 
                    className="btn-primary"
                    onClick={() => {
                        setFormData({
                            email: '',
                            password: '',
                            first_name: '',
                            last_name: '',
                            role: 'client'
                        });
                        setFormErrors({});
                        setIsCreateModalOpen(true);
                    }}
                >
                    Create User
                </button>
            </div>

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

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
                            <button 
                                className="text-sm font-medium text-red-700 hover:text-red-600 mt-1"
                                onClick={() => setError(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {temporaryPassword && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">Temporary password: <strong>{temporaryPassword}</strong></p>
                            <p className="text-xs text-yellow-500 mt-1">Please save this password. It will not be shown again.</p>
                            <button 
                                className="text-sm font-medium text-yellow-700 hover:text-yellow-600 mt-1"
                                onClick={() => setTemporaryPassword(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex space-x-2">
                            <button 
                                className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => setFilter('all')}
                            >
                                All Users
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-md ${filter === 'clients' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => setFilter('clients')}
                            >
                                Clients
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-md ${filter === 'managers' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
                                onClick={() => setFilter('managers')}
                            >
                                Managers
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="form-input py-2 pl-10 pr-4 rounded-md w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id} className={!user.is_active ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-800 font-medium">
                                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.roles.map(role => (
                                                <span key={role} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {role}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.last_login 
                                                ? new Date(user.last_login).toLocaleString() 
                                                : 'Never'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    className="text-primary-600 hover:text-primary-900"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    onClick={() => handleResetPassword(user.user_id)}
                                                >
                                                    Reset Password
                                                </button>
                                                {user.is_active ? (
                                                    <button 
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => handleDeactivateUser(user.user_id)}
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="text-green-600 hover:text-green-900"
                                                        onClick={() => handleReactivateUser(user.user_id)}
                                                    >
                                                        Reactivate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Create New User</h2>
                            <button 
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                                    {formErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
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
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
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
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="form-select mt-1 block w-full rounded-md"
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
                                    onClick={() => setIsCreateModalOpen(false)}
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
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Edit User</h2>
                            <button 
                                className="text-gray-400 hover:text-gray-500"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-input mt-1 block w-full rounded-md bg-gray-100"
                                        value={formData.email}
                                        disabled
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
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
                                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
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
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        className="form-select mt-1 block w-full rounded-md"
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
                                    onClick={() => setIsEditModalOpen(false)}
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
            )}
        </div>
    );
};

export default UserManagement;
