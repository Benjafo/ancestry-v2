import { useEffect, useState } from 'react';
import { ClientProfile, authApi, clientApi } from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import { getUser } from '../utils/auth';
import {
    validateAddress,
    validateAddressGroup,
    validateCity,
    validateCountry,
    validatePassword,
    validatePasswordMatch,
    validatePhone,
    validateState,
    validateZipCode
} from '../utils/validationUtils';
import { STATES_BY_COUNTRY, getStateCodeFromName } from '../utils/locationData';

interface ProfileFormData extends ClientProfile {
    first_name: string;
    last_name: string;
    email: string;
}

const Settings = () => {
    const user = getUser();

    // Validation state
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    
    // Email preferences state
    const [emailPreferences, setEmailPreferences] = useState({
        email_notifications: true,
        research_updates: true
    });
    const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
    const [preferencesError, setPreferencesError] = useState<string | null>(null);
    const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(null);
    
    // State/province options based on selected country
    const [stateOptions, setStateOptions] = useState<Array<{code: string, name: string}>>([]);

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const data = await clientApi.getProfile();
                
                // Handle potential state name to code conversion
                let profileState = data.profile.state;
                if (data.profile.country && STATES_BY_COUNTRY[data.profile.country]) {
                    // Check if state is a full name instead of a code
                    const stateMatch = STATES_BY_COUNTRY[data.profile.country].find(
                        state => state.name.toLowerCase() === data.profile.state?.toLowerCase()
                    );
                    if (stateMatch) {
                        profileState = stateMatch.code;
                    }
                }
                
                setProfileData(prev => ({
                    ...prev,
                    ...data.profile,
                    state: profileState || data.profile.state
                }));
            } catch (err: unknown) {
                console.error('Error fetching profile data:', err);
                // Try to extract error message from the API response if available
                const errorMessage = 
                    typeof err === 'object' && err !== null && 'response' in err && typeof err.response === 'object' && err.response !== null && 'message' in err.response
                        ? String(err.response.message)
                        : err instanceof Error
                            ? err.message
                            : 'Failed to load profile data';
                setProfileError(errorMessage);
            }
        };

        fetchProfileData();
    }, []);
    
    // Update state options when country changes
    useEffect(() => {
        if (profileData.country && STATES_BY_COUNTRY[profileData.country]) {
            setStateOptions(STATES_BY_COUNTRY[profileData.country]);
        } else {
            setStateOptions([]);
        }
    }, [profileData.country]);
    
    // Initialize email preferences from profile data
    useEffect(() => {
        if (profileData) {
            setEmailPreferences({
                email_notifications: profileData.email_notifications ?? true,
                research_updates: profileData.research_updates ?? true
            });
        }
    }, [profileData]);
    
    // Handle email preference changes
    const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setEmailPreferences(prev => ({
            ...prev,
            [name]: checked
        }));
    };
    
    // Handle email preferences form submission
    const handlePreferencesSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPreferencesError(null);
        setPreferencesSuccess(null);
        setIsUpdatingPreferences(true);
        
        try {
            const response = await clientApi.updateProfile(emailPreferences);
            setPreferencesSuccess(response.message || 'Email preferences updated successfully');
        } catch (err: unknown) {
            console.error('Error updating email preferences:', err);
            // Try to extract error message from the API response if available
            const errorMessage = 
                typeof err === 'object' && err !== null && 'response' in err && typeof err.response === 'object' && err.response !== null && 'message' in err.response
                    ? String(err.response.message)
                    : err instanceof Error
                        ? err.message
                        : 'Failed to update email preferences';
            setPreferencesError(errorMessage);
        } finally {
            setIsUpdatingPreferences(false);
        }
    };

    // Handle profile form changes
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Update form data
        const updatedProfileData = {
            ...profileData,
            [name]: value
        };
        setProfileData(updatedProfileData);
    };

    // Handle profile form submission
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess(null);

        // Validate all fields before submission
        const newValidationErrors: Record<string, string> = {};

        // Validate phone
        const phoneValidation = validatePhone(profileData.phone || '');
        if (!phoneValidation.isValid && phoneValidation.message) {
            newValidationErrors.phone = phoneValidation.message;
        }

        // Check if any address field is filled
        const anyAddressFieldFilled = !!(
            profileData.address ||
            profileData.city ||
            profileData.state ||
            profileData.zip_code ||
            profileData.country
        );

        // Validate address fields as a group
        if (anyAddressFieldFilled) {
            const groupValidation = validateAddressGroup(
                profileData.address || '',
                profileData.city || '',
                profileData.state || '',
                profileData.zip_code || '',
                profileData.country || ''
            );

            if (!groupValidation.isValid && groupValidation.message && groupValidation.field) {
                newValidationErrors[groupValidation.field] = groupValidation.message;
            }
        }

        // If any address field is filled, also validate their format
        if (anyAddressFieldFilled) {
            // Validate address format
            const addressValidation = validateAddress(profileData.address || '', true);
            if (!addressValidation.isValid && addressValidation.message) {
                newValidationErrors.address = addressValidation.message;
            }

            // Validate city format
            const cityValidation = validateCity(profileData.city || '', true);
            if (!cityValidation.isValid && cityValidation.message) {
                newValidationErrors.city = cityValidation.message;
            }

            // Validate state format
            const stateValidation = validateState(profileData.state || '', profileData.country || '', true);
            if (!stateValidation.isValid && stateValidation.message) {
                newValidationErrors.state = stateValidation.message;
            }

            // Validate zip code format
            const zipValidation = validateZipCode(profileData.zip_code || '', profileData.country || '', true);
            if (!zipValidation.isValid && zipValidation.message) {
                newValidationErrors.zip_code = zipValidation.message;
            }

            // Validate country format
            const countryValidation = validateCountry(profileData.country || '', true);
            if (!countryValidation.isValid && countryValidation.message) {
                newValidationErrors.country = countryValidation.message;
            }
        }

        // If there are validation errors, update the state and return
        if (Object.keys(newValidationErrors).length > 0) {
            setValidationErrors(newValidationErrors);
            return;
        }

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
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            // Try to extract error message from the API response if available
            const errorMessage = 
                typeof err === 'object' && err !== null && 'response' in err && typeof err.response === 'object' && err.response !== null && 'message' in err.response
                    ? String(err.response.message)
                    : err instanceof Error
                        ? err.message
                        : 'Failed to update profile';
            setProfileError(errorMessage);
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

        // Clear any previous password error
        setPasswordError(null);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        // Validate passwords
        const passwordValidation = validatePassword(passwordData.newPassword);
        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.message || 'Invalid password');
            return;
        }

        const passwordMatchValidation = validatePasswordMatch(
            passwordData.newPassword,
            passwordData.confirmPassword
        );
        if (!passwordMatchValidation.isValid) {
            setPasswordError(passwordMatchValidation.message || 'Passwords do not match');
            return;
        }

        setIsChangingPassword(true);

        try {
            // Call the API to change the password
            const response = await authApi.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            setPasswordSuccess(response.message || 'Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: unknown) {
            console.error('Error changing password:', err);
            // Try to extract error message from the API response if available
            const errorMessage = 
                typeof err === 'object' && err !== null && 'response' in err && typeof err.response === 'object' && err.response !== null && 'message' in err.response
                    ? String(err.response.message)
                    : err instanceof Error
                        ? err.message
                        : 'Failed to change password. Please try again.';
            setPasswordError(errorMessage);
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

                    {profileError && <ErrorAlert message={profileError} />}

                    {profileSuccess && <SuccessAlert message={profileSuccess} />}

                    {/* Display validation errors */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mb-4">
                            <ErrorAlert
                                message="Please correct the following errors:"
                            />
                            <ul className="mt-2 list-disc list-inside text-sm text-red-600">
                                {Object.entries(validationErrors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
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
                                    {stateOptions.length > 0 ? (
                                        <select
                                            name="state"
                                            id="state"
                                            className="form-input"
                                            value={profileData.state}
                                            onChange={handleProfileChange}
                                        >
                                            <option value="" disabled>Select a state/province</option>
                                            {stateOptions.map(state => (
                                                <option key={state.code} value={state.code}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            name="state"
                                            id="state"
                                            className="form-input"
                                            value={profileData.state}
                                            onChange={handleProfileChange}
                                            placeholder="Enter state/province"
                                        />
                                    )}
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
                                        <option value="" disabled>Select a country</option>
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

                    {passwordError && <ErrorAlert message={passwordError} />}

                    {passwordSuccess && <SuccessAlert message={passwordSuccess} />}

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
                    
                    {preferencesError && <ErrorAlert message={preferencesError} />}
                    
                    {preferencesSuccess && <SuccessAlert message={preferencesSuccess} />}
                    
                    <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="email_notifications"
                                    name="email_notifications"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={emailPreferences.email_notifications}
                                    onChange={handlePreferenceChange}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="email_notifications" className="font-medium text-gray-700 dark:text-gray-300">
                                    Marketing Emails
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">Receive emails about new features, promotions, and updates.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="research_updates"
                                    name="research_updates"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={emailPreferences.research_updates}
                                    onChange={handlePreferenceChange}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="research_updates" className="font-medium text-gray-700 dark:text-gray-300">
                                    Newsletter
                                </label>
                                <p className="text-gray-500 dark:text-gray-400">Receive our monthly newsletter with genealogy tips and resources.</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isUpdatingPreferences}
                            >
                                {isUpdatingPreferences ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </form>
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
