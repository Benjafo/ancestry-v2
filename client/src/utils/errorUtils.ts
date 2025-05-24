// This file will contain centralized error handling utilities.

import { HTTPError } from 'ky';

/**
 * Safely extracts a user-friendly error message from an unknown error object.
 * Prioritizes messages from API responses (ky's HTTPError), then generic Error messages,
 * and finally provides a fallback.
 * @param error The unknown error object.
 * @returns A user-friendly error message string.
 */
export const getApiErrorMessage = async (error: unknown): Promise<string> => {
    if (error instanceof HTTPError) {
        try {
            const errorBody = await error.response.json();
            if (errorBody && typeof errorBody.message === 'string') {
                return errorBody.message;
            }
        } catch (parseError) {
            console.log('Failed to parse error response as JSON:', parseError);

            // Fallback to text if JSON parsing fails
            try {
                const errorText = await error.response.text();
                if (errorText) {
                    return errorText;
                }
            } catch (textError) {
                console.log('Failed to parse error response as text:', textError);

                // If even text parsing fails, use status text
                return error.response.statusText || `HTTP Error: ${error.response.status}`;
            }
        }
        return `HTTP Error: ${error.response.status}`;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return String(error) || 'An unknown error occurred. Please try again.';
};
