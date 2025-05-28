import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import { authApi } from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import { getApiErrorMessage } from '../utils/errorUtils';

const RequestPasswordReset: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        try {
            const response = await authApi.requestPasswordReset(email);
            setSuccessMessage(response.message);

            // Immediately redirect to the reset link if provided (for development/testing without mail server)
            if (response.resetUrl) {
                window.location.href = response.resetUrl; // Use window.location.href for external redirect
            }
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Request password reset error:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Request Password Reset
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {error && <ErrorAlert message={error} />}
                {successMessage && <SuccessAlert message={successMessage} />}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="form-input rounded-md"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex justify-center"
                        >
                            {isLoading ? 'Sending link...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RequestPasswordReset;
