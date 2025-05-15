/**
 * Validation utility functions for form fields
 */

/**
 * Validates a phone number
 * @param phone The phone number to validate
 * @returns Object with isValid flag and optional error message
 */
export const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
    if (!phone) return { isValid: true }; // Optional field

    // Basic international phone format
    const phoneRegex = /^\+?[1-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
        return {
            isValid: false,
            message: 'Please enter a valid phone number (e.g., 1234567890)'
        };
    }

    return { isValid: true };
};

/**
 * Validates a ZIP/Postal code based on the country
 * @param zipCode The ZIP/Postal code to validate
 * @param country The country code (e.g., 'USA', 'CAN')
 * @param required Whether the field is required
 * @returns Object with isValid flag and optional error message
 */
export const validateZipCode = (zipCode: string, country: string, required = false): { isValid: boolean; message?: string } => {
    if (!zipCode) return required
        ? { isValid: false, message: 'ZIP/Postal code is required' }
        : { isValid: true }; // Optional field if not required

    let isValid = false;
    let message = '';

    switch (country) {
        case 'USA':
            // US ZIP code: 5 digits or 5+4 format
            isValid = /^\d{5}(-\d{4})?$/.test(zipCode);
            message = 'US ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)';
            break;

        case 'CAN':
            // Canadian postal code: A1A 1A1 format
            isValid = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(zipCode);
            message = 'Canadian postal code must be in A1A 1A1 format';
            break;

        case 'GBR':
            // UK postcode: Various formats
            isValid = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(zipCode);
            message = 'UK postcode format is invalid';
            break;

        case 'AUS':
            // Australian postcode: 4 digits
            isValid = /^\d{4}$/.test(zipCode);
            message = 'Australian postcode must be 4 digits';
            break;

        default:
            // For other countries, just ensure it's not empty
            isValid = zipCode.trim().length > 0;
            message = 'Please enter a valid postal code';
    }

    return { isValid, message: isValid ? undefined : message };
};

/**
 * Validates a city name
 * @param city The city name to validate
 * @param required Whether the field is required
 * @returns Object with isValid flag and optional error message
 */
export const validateCity = (city: string, required = false): { isValid: boolean; message?: string } => {
    if (!city) return required
        ? { isValid: false, message: 'City is required' }
        : { isValid: true }; // Optional field if not required

    if (city.length < 2) {
        return { isValid: false, message: 'City name must be at least 2 characters' };
    }

    // City should contain only letters, spaces, hyphens, and apostrophes
    if (!/^[A-Za-z\s\-']+$/.test(city)) {
        return { isValid: false, message: 'City name contains invalid characters' };
    }

    return { isValid: true };
};

import { STATES_BY_COUNTRY } from './locationData';

/**
 * Validates a state/province name or code
 * @param state The state/province to validate
 * @param country The country code (e.g., 'USA', 'CAN')
 * @param required Whether the field is required
 * @returns Object with isValid flag and optional error message
 */
export const validateState = (state: string, country: string = '', required = false): { isValid: boolean; message?: string } => {
    if (!state) return required
        ? { isValid: false, message: 'State/Province is required' }
        : { isValid: true }; // Optional field if not required

    // For countries with predefined states, validate against the list
    if (country && STATES_BY_COUNTRY[country]) {
        const validStateCodes = STATES_BY_COUNTRY[country].map(s => s.code);
        if (!validStateCodes.includes(state)) {
            return { isValid: false, message: 'Please select a valid state/province' };
        }
    } else if (state.length < 2) {
        // For other countries, just check the length
        return { isValid: false, message: 'State/province must be at least 2 characters' };
    }

    return { isValid: true };
};

/**
 * Validates an address
 * @param address The address to validate
 * @param required Whether the field is required
 * @returns Object with isValid flag and optional error message
 */
export const validateAddress = (address: string, required = false): { isValid: boolean; message?: string } => {
    if (!address) return required
        ? { isValid: false, message: 'Street address is required' }
        : { isValid: true }; // Optional field if not required

    if (address.length < 5) {
        return { isValid: false, message: 'Address must be at least 5 characters' };
    }

    if (address.length > 100) {
        return { isValid: false, message: 'Address must be less than 100 characters' };
    }

    return { isValid: true };
};

/**
 * Validates a country
 * @param country The country to validate
 * @param required Whether the field is required
 * @returns Object with isValid flag and optional error message
 */
export const validateCountry = (country: string, required = false): { isValid: boolean; message?: string } => {
    if (!country) return required
        ? { isValid: false, message: 'Country is required' }
        : { isValid: true }; // Optional field if not required

    if (country.length < 2 || country.toLowerCase() === 'select a country') {
        return { isValid: false, message: 'Please select a valid country' };
    }

    return { isValid: true };
};

/**
 * Validates a password
 * @param password The password to validate
 * @returns Object with isValid flag and optional error message
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (!password) return { isValid: false, message: 'Password is required' };

    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }

    return { isValid: true };
};

/**
 * Validates that two passwords match
 * @param password The password
 * @param confirmPassword The confirmation password
 * @returns Object with isValid flag and optional error message
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean; message?: string } => {
    if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' };

    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }

    return { isValid: true };
};

/**
 * Validates that address fields are filled as a group
 * If any one field is filled, all must be filled
 * @param address Street address
 * @param city City
 * @param state State/Province
 * @param zipCode ZIP/Postal code
 * @param country Country
 * @returns Object with isValid flag and optional error message
 */
export const validateAddressGroup = (
    address: string,
    city: string,
    state: string,
    zipCode: string,
    country: string
): { isValid: boolean; message?: string; field?: string } => {
    // Check if any field is filled
    const anyFilled = !!(address || city || state || zipCode || country);

    // If any field is filled, all must be filled
    if (anyFilled) {
        if (!address) {
            return { isValid: false, message: 'Street address is required', field: 'address' };
        }
        if (!city) {
            return { isValid: false, message: 'City is required', field: 'city' };
        }
        if (!state) {
            return { isValid: false, message: 'State/Province is required', field: 'state' };
        }
        if (!zipCode) {
            return { isValid: false, message: 'ZIP/Postal code is required', field: 'zip_code' };
        }
        if (!country || country.toLowerCase() === 'select a country') {
            return { isValid: false, message: 'Country is required', field: 'country' };
        }
    }

    return { isValid: true };
};
