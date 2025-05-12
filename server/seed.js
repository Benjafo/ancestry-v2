const { 
    connectToDatabase, 
    createDatabaseIfNotExists, 
    runSeed 
} = require('./seed_utils');

// Import seed modules
const seedDatabaseSchema = require('./seeds/database');
const seedUsers = require('./seeds/users');
const seedProjects = require('./seeds/projects');
const seedPersons = require('./seeds/persons');
const seedRelationships = require('./seeds/relationships');
const seedEvents = require('./seeds/events');
const seedDocuments = require('./seeds/documents');
const seedNotificationsActivities = require('./seeds/notificationsActivities');

/**
 * Main function to seed the database
 */
async function seedDatabase() {
    try {
        // Create database if it doesn't exist
        await createDatabaseIfNotExists();
        
        // Connect to the database
        const sequelize = await connectToDatabase();
        
        // Start a transaction to ensure data consistency
        const transaction = await sequelize.transaction();
        
        try {
            // Set up database schema
            await runSeed(
                (t) => seedDatabaseSchema(sequelize, t),
                'Database Schema',
                transaction
            );
            
            // Seed users and roles
            const { adminUser, clientUser, managerRole, clientRole } = 
                await runSeed(seedUsers, 'Users and Roles', transaction);
            
            // Seed projects
            const { project1 } = 
                await runSeed(
                    (t) => seedProjects(t, { adminUser, clientUser }), 
                    'Projects', 
                    transaction
                );
            
            // Seed persons and link to projects
            const persons = 
                await runSeed(
                    (t) => seedPersons(t, { project1 }),
                    'Persons and Project Associations',
                    transaction
                );
            
            // Seed relationships
            await runSeed(
                (t) => seedRelationships(t, persons), 
                'Relationships', 
                transaction
            );
            
            // Seed events
            const events = 
                await runSeed(
                    (t) => seedEvents(t, { persons, project1 }), 
                    'Events', 
                    transaction
                );
            
            // Seed documents
            const documents = 
                await runSeed(
                    (t) => seedDocuments(t, { persons, events, project1 }), 
                    'Documents', 
                    transaction
                );
            
            // Seed notifications and activities
            await runSeed(
                (t) => seedNotificationsActivities(t, { adminUser, clientUser, project1, persons, events, documents }), 
                'Notifications and Activities', 
                transaction
            );
            
            // Commit the transaction
            await transaction.commit();
            console.log('Database seeding completed successfully!');
            
        } catch (error) {
            // Rollback the transaction on error
            await transaction.rollback();
            console.error('Error seeding database:', error);
            throw error;
        } finally {
            // Close the database connection
            await sequelize.close();
        }
        
    } catch (error) {
        console.error('Fatal error during database seeding:', error);
        process.exit(1);
    }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
