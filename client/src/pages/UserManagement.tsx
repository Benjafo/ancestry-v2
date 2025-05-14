import { useEffect, useState } from 'react';
import { UserDetails, managerApi } from '../api/client';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';
import InfoAlert from '../components/common/InfoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SuccessAlert from '../components/common/SuccessAlert';

const UserManagement = () => {
    const [users, setUsers] = useState<UserDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'clients' | 'managers'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'name' | 'email' | 'role' | 'status' | 'last_login' | ''>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
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
        setIsEditModalOpen(true);
    };

    const handleSort = (field: 'name' | 'email' | 'role' | 'status' | 'last_login') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Apply filters
    const filteredUsers = users.filter(user => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = (
            user.first_name.toLowerCase().includes(searchTermLower) ||
            user.last_name.toLowerCase().includes(searchTermLower) ||
            user.email.toLowerCase().includes(searchTermLower)
        );

        // Apply status filter
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && user.is_active) ||
            (statusFilter === 'inactive' && !user.is_active);

        return matchesSearch && matchesStatus;
    });

    // Apply sorting
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortField === 'name') {
            const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
            const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
            return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        } else if (sortField === 'email') {
            return sortDirection === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
        } else if (sortField === 'role') {
            const roleA = a.roles[0] || '';
            const roleB = b.roles[0] || '';
            return sortDirection === 'asc' ? roleA.localeCompare(roleB) : roleB.localeCompare(roleA);
        } else if (sortField === 'status') {
            const statusA = a.is_active ? 'active' : 'inactive';
            const statusB = b.is_active ? 'active' : 'inactive';
            return sortDirection === 'asc' ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
        } else if (sortField === 'last_login') {
            const dateA = a.last_login ? new Date(a.last_login).getTime() : 0;
            const dateB = b.last_login ? new Date(b.last_login).getTime() : 0;
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return 0;
    });

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
                <button
                    className="btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create User
                </button>
            </div>

            {successMessage && <SuccessAlert message={successMessage} />}

            {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

            {temporaryPassword && (
                <InfoAlert
                    message={`Temporary password: ${temporaryPassword}. Please save this password. It will not be shown again.`}
                    onDismiss={() => setTemporaryPassword(null)}
                />
            )}

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <div className="flex space-x-2">
                                <button
                                    className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    All Users
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-md ${filter === 'clients' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                                    onClick={() => setFilter('clients')}
                                >
                                    Clients
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-md ${filter === 'managers' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                                    onClick={() => setFilter('managers')}
                                >
                                    Managers
                                </button>
                            </div>
                            <select
                                className="form-select rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
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
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('name')}
                                >
                                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('email')}
                                >
                                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('role')}
                                >
                                    Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('status')}
                                >
                                    Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort('last_login')}
                                >
                                    Last Login {sortField === 'last_login' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {/* Action */}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4">
                                        <EmptyState message="No users found" />
                                    </td>
                                </tr>
                            ) : (
                                sortedUsers.map((user) => (
                                    <tr key={user.user_id} className={!user.is_active ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-800 dark:text-primary-200 font-medium">
                                                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.roles.map(role => (
                                                <span key={role} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {role}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {user.last_login
                                                ? new Date(user.last_login).toLocaleString()
                                                : 'Never'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    Edit
                                                </button>
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
                <CreateUserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setSuccessMessage('User created successfully');
                        fetchUsers();
                        setIsCreateModalOpen(false); // Close the modal
                        setTimeout(() => {
                            setSuccessMessage(null);
                        }, 3000);
                    }}
                />
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    user={selectedUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={(message) => {
                        setSuccessMessage(message);
                        fetchUsers();
                        setTimeout(() => {
                            setSuccessMessage(null);
                        }, 3000);
                    }}
                    onResetPassword={handleResetPassword}
                />
            )}
        </div>
    );
};

export default UserManagement;
