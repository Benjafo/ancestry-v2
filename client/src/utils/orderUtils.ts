/**
 * Utility functions for order processing and display.
 */

/**
 * Formats the order status for display.
 * @param {string} status - The raw order status (e.g., 'pending', 'paid', 'completed').
 * @returns {string} A human-readable formatted status.
 */
export const formatOrderStatus = (status: string): string => {
    switch (status) {
        case 'pending':
            return 'Pending Payment';
        case 'paid':
            return 'Payment Received';
        case 'processing':
            return 'In Progress';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

/**
 * Formats a price amount for display (e.g., 10000 -> $100.00).
 * Assumes amount is in cents.
 * @param {number} amount - The amount in cents.
 * @param {string} currency - The currency code (e.g., 'USD').
 * @returns {string} The formatted price string.
 */
export const formatPrice = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount / 100); // Convert cents to dollars
};

/**
 * Processes a list of features for display.
 * @param {string[]} features - An array of feature strings.
 * @returns {string[]} An array of formatted feature strings.
 */
export const processFeatures = (features: string[]): string[] => {
    return features.map(feature => {
        // Example: Add a checkmark or other formatting
        return `✓ ${feature}`;
    });
};

// You can add more utility functions here as needed, e.g., for date formatting,
// validation helpers specific to orders, etc.
