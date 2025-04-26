import { useState } from 'react';
import { logout } from '../utils/auth';

const Settings = () => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }

        setIsChangingPassword(true);

        try {
            // In a real app, we would call an API
            // await authApi.changePassword(passwordData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setPasswordSuccess('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            console.error('Error changing password:', err);
            setPasswordError('Failed to change password. Please try again.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleteError(null);

        if (deleteConfirmation !== 'DELETE') {
            setDeleteError('Please type DELETE to confirm account deletion');
            return;
        }

        setIsDeleting(true);

        try {
            // In a real app, we would call an API
            // await authApi.deleteAccount();
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Log the user out
            logout();
        } catch (err) {
            console.error('Error deleting account:', err);
            setDeleteError('Failed to delete account. Please try again.');
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
            </div>

            {/* Password Change Section */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                    
                    {passwordError && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{passwordError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{passwordSuccess}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isChangingPassword}
                            >
                                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Email Preferences Section */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Email Preferences</h2>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="marketing"
                                    name="marketing"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    defaultChecked
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="marketing" className="font-medium text-gray-700">
                                    Marketing Emails
                                </label>
                                <p className="text-gray-500">Receive emails about new features, promotions, and updates.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="newsletter"
                                    name="newsletter"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    defaultChecked
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="newsletter" className="font-medium text-gray-700">
                                    Newsletter
                                </label>
                                <p className="text-gray-500">Receive our monthly newsletter with genealogy tips and resources.</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="btn-primary"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Section */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-red-600 mb-4">Delete Account</h2>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                    </p>
                    
                    {deleteError && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{deleteError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleDeleteAccount} className="space-y-4">
                        <div>
                            <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                Type "DELETE" to confirm
                            </label>
                            <input
                                type="text"
                                name="deleteConfirmation"
                                id="deleteConfirmation"
                                className="form-input"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
