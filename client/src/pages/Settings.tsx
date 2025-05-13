import { useEffect, useState } from 'react';
import { ClientProfile, clientApi } from '../api/client';
import { getUser } from '../utils/auth';

interface ProfileFormData extends ClientProfile {
    first_name: string;
    last_name: string;
    email: string;
}

const Settings = () => {
    const user = getUser();

    // Password state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Account deletion state
    // const [isDeleting, setIsDeleting] = useState(false);
    // const [deleteConfirmation, setDeleteConfirmation] = useState('');
    // const [deleteError, setDeleteError] = useState<string | null>(null);

    // Profile state
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<ProfileFormData>({
        user_id: user?.user_id || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: ''
    });

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await clientApi.getProfile();
                setProfileData(prev => ({
                    ...prev,
                    ...data.profile
                }));
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setProfileError('Failed to load profile data');
            }
        };

        fetchProfileData();
    }, []);

    // Handle profile form changes
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess(null);
        setIsUpdatingProfile(true);

        try {
            // Extract only the client profile fields (not first_name, last_name, email)
            const profileDataToUpdate = Object.fromEntries(
                Object.entries(profileData).filter(([key]) => !['first_name', 'last_name', 'email'].includes(key))
            );

            // Update profile via API
            const response = await clientApi.updateProfile(profileDataToUpdate);

            setProfileSuccess(response.message || 'Profile updated successfully');
            setIsUpdatingProfile(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setProfileError('Failed to update profile');
            setIsUpdatingProfile(false);
        }
    };

    // Handle password form changes
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

    // const handleDeleteAccount = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setDeleteError(null);

    //     if (deleteConfirmation !== 'DELETE') {
    //         setDeleteError('Please type DELETE to confirm account deletion');
    //         return;
    //     }

    //     setIsDeleting(true);

    //     try {
    //         // In a real app, we would call an API
    //         // await authApi.deleteAccount();

    //         // Simulate API call
    //         await new Promise(resolve => setTimeout(resolve, 1000));

    //         // Log the user out
    //         logout();
    //     } catch (err) {
    //         console.error('Error deleting account:', err);
    //         setDeleteError('Failed to delete account. Please try again.');
    //         setIsDeleting(false);
    //     }
    // };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Account Settings</h1>
            </div>

            {/* Profile Information Section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h2>

                    {profileError && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{profileError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {profileSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">{profileSuccess}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    className="form-input"
                                    value={profileData.first_name}
                                    disabled
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Name cannot be changed</p>
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    className="form-input"
                                    value={profileData.last_name}
                                    disabled
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="form-input"
                                    value={profileData.email}
                                    disabled
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    className="form-input"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        id="address"
                                        className="form-input"
                                        value={profileData.address}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        className="form-input"
                                        value={profileData.city}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        id="state"
                                        className="form-input"
                                        value={profileData.state}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        ZIP / Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        id="zip_code"
                                        className="form-input"
                                        value={profileData.zip_code}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Country
                                    </label>
                                    <select
                                        name="country"
                                        id="country"
                                        className="form-input"
                                        value={profileData.country}
                                        onChange={handleProfileChange}
                                    >
                                        <option value="">Select a country</option>
                                        <option value="USA">United States</option>
                                        <option value="CAN">Canada</option>
                                        <option value="GBR">United Kingdom</option>
                                        <option value="AUS">Australia</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isUpdatingProfile}
                            >
                                {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>

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

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Preferences</h2>
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
                                <label htmlFor="marketing" className="font-medium text-gray-700 dark:text-gray-300">
                                    Marketing Emails
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">Receive emails about new features, promotions, and updates.</p>
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
                                <label htmlFor="newsletter" className="font-medium text-gray-700 dark:text-gray-300">
                                    Newsletter
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">Receive our monthly newsletter with genealogy tips and resources.</p>
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

            {/* Delete Account Section
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">Delete Account</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
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
                            <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div> */}
        </div>
    );
};

export default Settings;
