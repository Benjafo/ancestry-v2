const { ServicePackage } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Seeds the service_packages table
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Array>} Created service packages
 */
async function seedServicePackages(transaction) {
    console.log('Seeding service packages table...');

    const servicePackagesData = [
        {
            id: uuidv4(),
            name: 'Basic Ancestry Research',
            description: 'Fundamental research to trace 2-3 generations of a single family line.',
            price_cents: 49900, // $499.00
            currency: 'usd',
            features: [
                '2-3 generations research',
                'Basic documents included (birth, marriage, death certificates)',
                'Digital family tree (basic)',
                'Summary report of findings',
                '4-6 week delivery estimate',
            ],
            estimated_delivery_weeks: 6,
            is_active: true,
            sort_order: 10,
        },
        {
            id: uuidv4(),
            name: 'Comprehensive Family Tree',
            description: 'In-depth research across multiple family lines, tracing 4-5 generations.',
            price_cents: 99900, // $999.00
            currency: 'usd',
            features: [
                '4-5 generations research across multiple lines',
                'Extensive document retrieval (census, military, immigration records)',
                'Interactive digital family tree with detailed profiles',
                'Comprehensive research report with source citations',
                'One 30-minute consultation session',
                '8-12 week delivery estimate',
            ],
            estimated_delivery_weeks: 12,
            is_active: true,
            sort_order: 20,
        },
        {
            id: uuidv4(),
            name: 'Premium Archival Research',
            description: 'Advanced research including on-site archival visits and specialized record analysis.',
            price_cents: 249900, // $2499.00
            currency: 'usd',
            features: [
                'Custom-scoped research project',
                'On-site archival visits (travel costs may apply)',
                'Analysis of complex or rare historical documents',
                'Heirloom quality printed family tree and bound report',
                'Three 60-minute consultation sessions',
                '12-20 week delivery estimate',
                'Priority support',
            ],
            estimated_delivery_weeks: 20,
            is_active: true,
            sort_order: 30,
        },
        {
            id: uuidv4(),
            name: 'Inactive Sample Package',
            description: 'This is an inactive package for testing purposes.',
            price_cents: 10000, // $100.00
            currency: 'usd',
            features: ['Sample feature 1', 'Sample feature 2'],
            estimated_delivery_weeks: 4,
            is_active: false,
            sort_order: 99,
        },
    ];

    const servicePackages = await ServicePackage.bulkCreate(servicePackagesData, { transaction });
    console.log(`Service packages seeded successfully: ${servicePackages.length} packages created`);
    
    return servicePackages;
}

module.exports = seedServicePackages;
