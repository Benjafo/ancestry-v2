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
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (!phoneRegex.test(phone)) {
        return { 
            isValid: false, 
            message: 'Please enter a valid phone number (e.g., +1234567890)' 
        };
    }
    
    return { isValid: true };
};

/**
 * Validates a ZIP/Postal code based on the country
 * @param zipCode The ZIP/Postal code to validate
 * @param country The country code (e.g., 'USA', 'CAN')
 * @returns Object with isValid flag and optional error message
 */
export const validateZipCode = (zipCode: string, country: string): { isValid: boolean; message?: string } => {
    if (!zipCode) return { isValid: true }; // Optional field
    
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
 * @returns Object with isValid flag and optional error message
 */
export const validateCity = (city: string): { isValid: boolean; message?: string } => {
    if (!city) return { isValid: true }; // Optional field
    
    if (city.length < 2) {
        return { isValid: false, message: 'City name must be at least 2 characters' };
    }
    
    // City should contain only letters, spaces, hyphens, and apostrophes
    if (!/^[A-Za-z\s\-']+$/.test(city)) {
        return { isValid: false, message: 'City name contains invalid characters' };
    }
    
    return { isValid: true };
};

/**
 * Validates a state/province name or code
 * @param state The state/province to validate
 * @returns Object with isValid flag and optional error message
 */
export const validateState = (state: string): { isValid: boolean; message?: string } => {
    if (!state) return { isValid: true }; // Optional field
    
    if (state.length < 2) {
        return { isValid: false, message: 'State/province must be at least 2 characters' };
    }
    
    return { isValid: true };
};

/**
 * Validates an address
 * @param address The address to validate
 * @returns Object with isValid flag and optional error message
 */
export const validateAddress = (address: string): { isValid: boolean; message?: string } => {
    if (!address) return { isValid: true }; // Optional field
    
    if (address.length < 5) {
        return { isValid: false, message: 'Address must be at least 5 characters' };
    }
    
    if (address.length > 100) {
        return { isValid: false, message: 'Address must be less than 100 characters' };
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
