const { ServicePackage } = require('../models');
const stripeService = require('./stripeService'); // Import stripeService

const servicePackageService = {
    // This function will now fetch from Stripe
    getActiveServicePackages: async () => {
        try {
            // Fetch products from Stripe
            const stripeProducts = await stripeService.listProductsWithPrices();

            // Map Stripe products to your ServicePackage format
            const servicePackages = stripeProducts.map(product => {
                // Assuming a product has at least one price, and we take the first one
                const price = product.prices && product.prices.length > 0 ? product.prices[0] : null;

                if (!price) {
                    console.warn(`Stripe Product ${product.id} has no active prices. Skipping.`);
                    return null;
                }

                return {
                    id: product.id, // Use Stripe Product ID as the service package ID
                    name: product.name,
                    description: product.description,
                    price: price.unit_amount / 100, // Convert cents to dollars
                    features: product.metadata.features ? JSON.parse(product.metadata.features) : [], // Assuming features are JSON string in metadata
                    estimated_delivery_weeks: product.metadata.estimated_delivery_weeks || 'N/A', // Assuming in metadata
                    is_active: product.active,
                    sort_order: product.metadata.sort_order ? parseInt(product.metadata.sort_order) : 999, // Assuming sort_order in metadata
                };
            }).filter(pkg => pkg !== null && pkg.is_active) // Filter out products without prices or inactive ones
                .sort((a, b) => a.sort_order - b.sort_order); // Sort by sort_order

            return servicePackages;
        } catch (error) {
            console.error('Error fetching service packages from Stripe:', error);
            throw new Error('Failed to retrieve service packages.');
        }
    },

    // Keep other admin CRUD functions if they are still needed for local management
    // or decide to remove them if Stripe becomes the sole source of truth.
    // For now, we'll assume these might be used for other purposes or will be adapted.
    createServicePackage: async (packageData) => {
        // This function would typically interact with Stripe API to create products
        // or manage local database if it's still the source of truth for admin.
        // For now, leaving as a placeholder.
        console.warn('createServicePackage: This function needs to be adapted for Stripe integration.');
        throw new Error('Not implemented for Stripe integration yet.');
    },
    updateServicePackage: async (id, packageData) => {
        console.warn('updateServicePackage: This function needs to be adapted for Stripe integration.');
        throw new Error('Not implemented for Stripe integration yet.');
    },
    deleteServicePackage: async (id) => {
        console.warn('deleteServicePackage: This function needs to be adapted for Stripe integration.');
        throw new Error('Not implemented for Stripe integration yet.');
    },
    getServicePackageById: async (id) => {
        // This function would typically fetch from Stripe by product ID
        console.warn('getServicePackageById: This function needs to be adapted for Stripe integration.');
        throw new Error('Not implemented for Stripe integration yet.');
    },
};

module.exports = servicePackageService;
