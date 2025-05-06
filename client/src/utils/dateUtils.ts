/**
 * Format a date string to a localized date string
 * @param dateString The date string to format
 * @param fallback The fallback string to return if the date is invalid
 * @returns A formatted date string or the fallback if the date is invalid
 */
export const formatDate = (dateString: string | undefined | null, fallback: string = 'No date'): string => {
    if (!dateString) return fallback;
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return fallback;
    }
    
    return date.toLocaleDateString();
};

/**
 * Format a date string to a localized date and time string
 * @param dateString The date string to format
 * @param fallback The fallback string to return if the date is invalid
 * @returns A formatted date and time string or the fallback if the date is invalid
 */
export const formatDateTime = (dateString: string | undefined | null, fallback: string = 'No date'): string => {
    if (!dateString) return fallback;
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return fallback;
    }
    
    return date.toLocaleString();
};
