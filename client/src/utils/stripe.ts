import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Initializes and returns a Stripe.js instance.
 * This function ensures that Stripe.js is loaded only once.
 * @returns {Promise<Stripe | null>} A promise that resolves to the Stripe object or null if the key is not configured.
 */
export const getStripe = (): Promise<Stripe | null> => {
    if (!stripePromise) {
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.');
            return Promise.resolve(null);
        }

        stripePromise = loadStripe(publishableKey, {
            // Optional: Customize Stripe Elements appearance
            // For example, to match your Tailwind CSS theme
            // appearance: {
            //     theme: 'stripe', // 'stripe', 'flat', or 'night'
            //     variables: {
            //         colorPrimary: '#6366F1', // Indigo-500
            //         colorBackground: '#ffffff',
            //         colorText: '#1F2937', // Gray-800
            //         colorDanger: '#EF4444', // Red-500
            //         fontFamily: 'Inter, sans-serif',
            //     },
            // },
        });
    }
    return stripePromise;
};
