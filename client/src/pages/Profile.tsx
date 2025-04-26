import { useEffect, useState } from 'react';
import { ClientProfile, clientApi } from '../api/client';
import { getUser } from '../utils/auth';

interface ProfileFormData extends ClientProfile {
    first_name: string;
    last_name: string;
    email: string;
}

const Profile = () => {
    const user = getUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        user_id: user?.user_id || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        preferences: {
            emailNotifications: true,
            researchUpdates: true
        }
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch profile data from API
                const data = await clientApi.getProfile();
                
                // Merge with user data
                setFormData({
                    ...formData,
                    ...data.profile,
                });
                
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to load profile data');
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences!,
                [name]: checked
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSaving(true);

        try {
            // Extract only the client profile fields (not first_name, last_name, email)
            const { first_name, last_name, email, ...profileData } = formData;
            
            // Update profile via API
            const response = await clientApi.updateProfile(profileData);
            
            setSuccess('Profile updated successfully');
            setIsSaving(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
            setIsSaving(false);
        }
    };

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
                <h1 className="text-2xl font-semibold text-gray-900">Your Profile</h1>
            </div>

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
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                id="first_name"
                                className="form-input"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                id="last_name"
                                className="form-input"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    className="form-input"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    className="form-input"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                    State / Province
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    id="state"
                                    className="form-input"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                                    ZIP / Postal Code
                                </label>
                                <input
                                    type="text"
                                    name="zip_code"
                                    id="zip_code"
                                    className="form-input"
                                    value={formData.zip_code}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    id="country"
                                    className="form-input"
                                    value={formData.country}
                                    onChange={handleChange}
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

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="emailNotifications"
                                        name="emailNotifications"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        checked={formData.preferences?.emailNotifications}
                                        onChange={handleCheckboxChange}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                                        Email Notifications
                                    </label>
                                    <p className="text-gray-500">Receive email notifications about your account and research updates.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="researchUpdates"
                                        name="researchUpdates"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        checked={formData.preferences?.researchUpdates}
                                        onChange={handleCheckboxChange}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="researchUpdates" className="font-medium text-gray-700">
                                        Research Updates
                                    </label>
                                    <p className="text-gray-500">Receive notifications when there are updates to your research projects.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
