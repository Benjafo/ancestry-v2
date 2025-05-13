/**
 * Debug function to log date string details
 * @param dateString The date string to debug
 * @param label Optional label for the log
 */
export const debugDateString = (dateString: string | undefined | null, label: string = 'Date string'): void => {
    console.log(`${label}:`, dateString);
    console.log(`${label} type:`, typeof dateString);

    if (dateString) {
        console.log(`${label} length:`, dateString.toString().length);

        if (typeof dateString === 'string') {
            console.log(`${label} includes T:`, dateString.includes('T'));
            console.log(`${label} includes Z:`, dateString.includes('Z'));

            // Try to parse as date
            const date = new Date(dateString);
            console.log(`${label} parsed:`, !isNaN(date.getTime()) ? date.toString() : 'Invalid Date');

            // Try to parse as number
            if (/^\d+$/.test(dateString)) {
                const num = parseInt(dateString, 10);
                console.log(`${label} as number:`, num);
                console.log(`${label} as date from seconds:`, new Date(num * 1000).toString());
                console.log(`${label} as date from milliseconds:`, new Date(num).toString());
            }
        }
    }
};

/**
 * Format a date string to a localized date string
 * @param dateString The date string to format
 * @param fallback The fallback string to return if the date is invalid
 * @returns A formatted date string or the fallback if the date is invalid
 */
export const formatDate = (dateString: string | undefined | null, fallback: string = 'No date'): string => {
    if (!dateString) return fallback;

    try {
        // Try to parse the date
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            // If direct parsing fails, try to handle common formats
            if (typeof dateString === 'string') {
                // Try to handle ISO format with timezone
                if (dateString.includes('T') && dateString.includes('Z')) {
                    // Already tried with new Date() above
                    console.log('Failed to parse ISO date:', dateString);
                    return fallback;
                }

                // Try to handle YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    const [year, month, day] = dateString.split('-').map(Number);
                    const newDate = new Date(year, month - 1, day);
                    if (!isNaN(newDate.getTime())) {
                        console.log('Parsed date from YYYY-MM-DD:', newDate);
                        console.log('Formatted date:', newDate.toLocaleDateString());
                        return newDate.toLocaleDateString();
                    }
                }

                // Try to handle Unix timestamp (seconds since epoch)
                if (/^\d+$/.test(dateString)) {
                    const timestamp = parseInt(dateString, 10);
                    // Check if it's seconds (Unix timestamp) or milliseconds
                    const newDate = timestamp > 10000000000
                        ? new Date(timestamp) // milliseconds
                        : new Date(timestamp * 1000); // seconds

                    if (!isNaN(newDate.getTime())) {
                        return newDate.toLocaleDateString();
                    }
                }
            }

            console.log('Failed to parse date:', dateString);
            return fallback;
        }
        return date.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return fallback;
    }
};

/**
 * Format a date string to a localized date and time string
 * @param dateString The date string to format
 * @param fallback The fallback string to return if the date is invalid
 * @returns A formatted date and time string or the fallback if the date is invalid
 */
export const formatDateTime = (dateString: string | undefined | null, fallback: string = 'No date'): string => {
    if (!dateString) return fallback;

    try {
        // Try to parse the date
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            // If direct parsing fails, try to handle common formats
            if (typeof dateString === 'string') {
                // Try to handle ISO format with timezone
                if (dateString.includes('T') && dateString.includes('Z')) {
                    // Already tried with new Date() above
                    console.log('Failed to parse ISO date for datetime:', dateString);
                    return fallback;
                }

                // Try to handle YYYY-MM-DD format
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    const [year, month, day] = dateString.split('-').map(Number);
                    const newDate = new Date(year, month - 1, day);
                    if (!isNaN(newDate.getTime())) {
                        return newDate.toLocaleString();
                    }
                }

                // Try to handle Unix timestamp (seconds since epoch)
                if (/^\d+$/.test(dateString)) {
                    const timestamp = parseInt(dateString, 10);
                    // Check if it's seconds (Unix timestamp) or milliseconds
                    const newDate = timestamp > 10000000000
                        ? new Date(timestamp) // milliseconds
                        : new Date(timestamp * 1000); // seconds

                    if (!isNaN(newDate.getTime())) {
                        return newDate.toLocaleString();
                    }
                }
            }

            console.log('Failed to parse date for datetime:', dateString);
            return fallback;
        }

        return date.toLocaleString();
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return fallback;
    }
};
