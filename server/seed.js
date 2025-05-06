const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Import the models
const { User, Role, Project, ProjectDocument, ProjectTimeline, Person, Relationship, Event, Document, DocumentPerson } = require('./models');

async function seedDatabase() {
    // First connect to the default 'postgres' database
    console.log('Connecting to the target database...');
    console.log(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);
    const adminSequelize = new Sequelize(
        process.env.DATABASE_URL.replace('/ancestrydb', '/postgres'),
        {
            // host: process.env.DB_HOST,
            // port: process.env.DB_PORT,
            // username: process.env.DB_USER,
            // password: process.env.DB_PASSWORD,
            // database: 'postgres', // Connect to default postgres database
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false
        }
    );

    let sequelize;

    try {
        console.log('Starting database seeding process...');
        
        // Create the database if it doesn't exist
        console.log('Checking if database exists...');
        const [results] = await adminSequelize.query(`
            SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'
        `);
        
        if (results.length === 0) {
            console.log(`Database '${process.env.DB_NAME}' does not exist. Creating...`);
            await adminSequelize.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Database '${process.env.DB_NAME}' created successfully.`);
        } else {
            console.log(`Database '${process.env.DB_NAME}' already exists.`);
        }
        
        // Close the admin connection
        await adminSequelize.close();
        
        // Now connect to the target database
        sequelize = new Sequelize(
            process.env.DATABASE_URL,
            {
                // host: process.env.DB_HOST,
                // port: process.env.DB_PORT,
                // username: process.env.DB_USER,
                // password: process.env.DB_PASSWORD,
                // database: process.env.DB_NAME,
                dialect: 'postgres',
                logging: process.env.NODE_ENV === 'development' ? console.log : false
            }
        );
        
        // Start a transaction to ensure data consistency
        const transaction = await sequelize.transaction();

        try {
            // Drop all existing tables (optional if using CASCADE in schema.sql)
            console.log('Dropping existing tables...');
            await sequelize.query(`
                DROP TABLE IF EXISTS document_persons CASCADE;
                DROP TABLE IF EXISTS documents CASCADE;
                DROP TABLE IF EXISTS events CASCADE;
                DROP TABLE IF EXISTS relationships CASCADE;
                DROP TABLE IF EXISTS persons CASCADE;
                DROP TABLE IF EXISTS user_roles CASCADE;
                DROP TABLE IF EXISTS users CASCADE;
                DROP TABLE IF EXISTS roles CASCADE;
                DROP TABLE IF EXISTS projects CASCADE;
                DROP TABLE IF EXISTS project_users CASCADE;
                DROP TABLE IF EXISTS project_documents CASCADE;
                DROP TABLE IF EXISTS project_timelines CASCADE;
                DROP TABLE IF EXISTS client_profiles CASCADE;
                DROP TABLE IF EXISTS notifications CASCADE;
                DROP TABLE IF EXISTS activities CASCADE;
                DROP TABLE IF EXISTS password_reset_tokens CASCADE;
            `, { transaction });

            // Read schema.sql
            console.log('Reading schema file...');
            const schemaPath = '/app/schema.sql';
            const schema = fs.readFileSync(schemaPath, 'utf8');

            // Execute schema.sql using raw query
            console.log('Recreating database tables...');
            await sequelize.query(schema, { transaction });
            console.log('Database schema recreated successfully');
            
            // Read constraints.sql
            console.log('Reading constraints file...');
            const constraintsPath = '/app/constraints.sql';
            const constraints = fs.readFileSync(constraintsPath, 'utf8');

            // Execute constraints.sql using raw query
            console.log('Adding database constraints...');
            await sequelize.query(constraints, { transaction });
            console.log('Database constraints added successfully');

            // Create roles using Sequelize models
            console.log('Seeding roles table...');
            const clientRole = await Role.create({
                name: 'client',
                description: 'Regular user who purchases genealogy research services'
            }, { transaction });
            
            const managerRole = await Role.create({
                name: 'manager',
                description: 'Administrator who manages client data and research'
            }, { transaction });
            
            console.log('Roles seeded successfully');

            // Create users using Sequelize models
            console.log('Seeding users table...');
            const adminUser = await User.create({
                email: 'admin@example.com',
                password: 'password123', // Will be hashed by model hooks
                first_name: 'Admin',
                last_name: 'User'
            }, { transaction });
            
            const clientUser = await User.create({
                email: 'client@example.com',
                password: 'password123', // Will be hashed by model hooks
                first_name: 'Test',
                last_name: 'Client'
            }, { transaction });
            
            console.log('Users seeded successfully with password: password123');

            // Assign roles to users using Sequelize associations
            console.log('Assigning roles to users...');
            await adminUser.addRole(managerRole, { transaction });
            await clientUser.addRole(clientRole, { transaction });
            console.log('User roles assigned successfully');

            // Create test data for admin user
            console.log('Creating test data for admin user...');

            // Create three research projects managed by the admin
            const project1 = await Project.create({
                title: 'Smith Family Immigration Records',
                description: 'Research project to trace Smith family immigration patterns from Ireland to the United States',
                status: 'active',
                researcher_id: adminUser.user_id
            }, { transaction });

            /* const project2 = */ await Project.create({
                title: 'Johnson European Ancestry',
                description: 'Investigation into Johnson family roots in Scandinavia and Germany',
                status: 'active',
                researcher_id: adminUser.user_id
            }, { transaction });

            /* const project3 = */ await Project.create({
                title: 'Williams Military Service',
                description: 'Documentation of Williams family members who served in various military conflicts',
                status: 'on_hold',
                researcher_id: adminUser.user_id
            }, { transaction });
            
            console.log('Admin projects created successfully');

            // Add documents to the first project
            await ProjectDocument.create({
                project_id: project1.id,
                title: 'Ship Passenger Manifest',
                type: 'document',
                file_path: '/documents/manifest.pdf'
            }, { transaction });

            await ProjectDocument.create({
                project_id: project1.id,
                title: 'Birth Certificate',
                type: 'certificate',
                file_path: '/documents/birth_certificate.pdf'
            }, { transaction });
            
            console.log('Project documents created successfully');

            // Add timeline events to the first project
            await ProjectTimeline.create({
                project_id: project1.id,
                date: new Date('1892-04-15'),
                event: 'Arrival at Ellis Island',
                description: 'First Smith family members arrived in the United States through Ellis Island'
            }, { transaction });

            await ProjectTimeline.create({
                project_id: project1.id,
                date: new Date('1895-06-22'),
                event: 'Settlement in Boston',
                description: 'Smith family established their first home in Boston, Massachusetts'
            }, { transaction });
            
            console.log('Project timeline events created successfully');

            // Assign project to client user
            console.log('Assigning project to client user...');
            
            // Assign project to the client user with view access
            await sequelize.query(`
                INSERT INTO project_users (project_id, user_id, access_level, created_at, updated_at)
                VALUES ('${project1.id}', '${clientUser.user_id}', 'view', NOW(), NOW())
            `, { transaction });
            
            console.log('Client project assignment completed successfully');

            // Add family data to the first project (Smith Family Immigration Records)
            console.log('Adding family data to the Smith Family Immigration Records project...');
            
            // ===== GENERATION 1: GRANDPARENTS =====
            
            // Paternal Grandparents
            const johnSmithSr = await Person.create({
                first_name: 'John',
                middle_name: 'Patrick',
                last_name: 'Smith',
                gender: 'male',
                birth_date: new Date('1905-03-15'),
                birth_location: 'Dublin, Ireland',
                death_date: new Date('1980-11-22'),
                death_location: 'Boston, Massachusetts, USA',
                notes: 'Immigrated to the United States in 1925. Worked as a carpenter.'
            }, { transaction });
            
            const marySmith = await Person.create({
                first_name: 'Mary',
                maiden_name: 'O\'Connor',
                last_name: 'Smith',
                gender: 'female',
                birth_date: new Date('1908-06-10'),
                birth_location: 'Cork, Ireland',
                death_date: new Date('1985-04-03'),
                death_location: 'Boston, Massachusetts, USA',
                notes: 'Immigrated to the United States in 1925 with her husband. Worked as a seamstress.'
            }, { transaction });
            
            // Maternal Grandparents
            const robertJohnson = await Person.create({
                first_name: 'Robert',
                middle_name: 'James',
                last_name: 'Johnson',
                gender: 'male',
                birth_date: new Date('1910-09-28'),
                birth_location: 'New York, New York, USA',
                death_date: new Date('1990-07-14'),
                death_location: 'Chicago, Illinois, USA',
                notes: 'Worked as an accountant. Served in World War II.'
            }, { transaction });
            
            const elizabethJohnson = await Person.create({
                first_name: 'Elizabeth',
                maiden_name: 'Williams',
                last_name: 'Johnson',
                gender: 'female',
                birth_date: new Date('1912-11-05'),
                birth_location: 'Philadelphia, Pennsylvania, USA',
                death_date: new Date('1995-02-20'),
                death_location: 'Chicago, Illinois, USA',
                notes: 'Worked as a teacher. Active in community service.'
            }, { transaction });
            
            // ===== GENERATION 2: PARENTS =====
            
            // Parents
            const johnSmithJr = await Person.create({
                first_name: 'John',
                middle_name: 'Michael',
                last_name: 'Smith',
                gender: 'male',
                birth_date: new Date('1935-08-12'),
                birth_location: 'Boston, Massachusetts, USA',
                death_date: new Date('2010-05-30'),
                death_location: 'Boston, Massachusetts, USA',
                notes: 'Worked as an engineer. Veteran of the Korean War.'
            }, { transaction });
            
            const margaretSmith = await Person.create({
                first_name: 'Margaret',
                maiden_name: 'Johnson',
                last_name: 'Smith',
                gender: 'female',
                birth_date: new Date('1938-04-22'),
                birth_location: 'Chicago, Illinois, USA',
                death_date: new Date('2015-09-18'),
                death_location: 'Boston, Massachusetts, USA',
                notes: 'Worked as a nurse. Enjoyed gardening and painting.'
            }, { transaction });
            
            // Siblings of Parents
            const thomasSmith = await Person.create({
                first_name: 'Thomas',
                middle_name: 'Joseph',
                last_name: 'Smith',
                gender: 'male',
                birth_date: new Date('1940-02-14'),
                birth_location: 'Boston, Massachusetts, USA',
                death_date: new Date('2018-12-05'),
                death_location: 'New York, New York, USA',
                notes: 'Worked as a lawyer. Never married.'
            }, { transaction });
            
            const sarahMiller = await Person.create({
                first_name: 'Sarah',
                maiden_name: 'Johnson',
                last_name: 'Miller',
                gender: 'female',
                birth_date: new Date('1942-07-30'),
                birth_location: 'Chicago, Illinois, USA',
                notes: 'Retired teacher. Currently living in Florida.'
            }, { transaction });
            
            // ===== GENERATION 3: CHILDREN =====
            
            const michaelSmith = await Person.create({
                first_name: 'Michael',
                middle_name: 'Robert',
                last_name: 'Smith',
                gender: 'male',
                birth_date: new Date('1965-11-08'),
                birth_location: 'Boston, Massachusetts, USA',
                notes: 'Works as a software engineer. Married with two children.'
            }, { transaction });
            
            const jenniferDavis = await Person.create({
                first_name: 'Jennifer',
                maiden_name: 'Smith',
                last_name: 'Davis',
                gender: 'female',
                birth_date: new Date('1968-03-25'),
                birth_location: 'Boston, Massachusetts, USA',
                notes: 'Works as a marketing executive. Has three children.'
            }, { transaction });
            
            const davidSmith = await Person.create({
                first_name: 'David',
                middle_name: 'John',
                last_name: 'Smith',
                gender: 'male',
                birth_date: new Date('1972-09-17'),
                birth_location: 'Boston, Massachusetts, USA',
                notes: 'Works as a physician. Married with one child.'
            }, { transaction });
            
            // ===== RELATIONSHIPS =====
            console.log('Creating family relationships...');
            
            // Marriage relationships
            await Relationship.create({
                person1_id: johnSmithSr.person_id,
                person2_id: marySmith.person_id,
                relationship_type: 'spouse',
                start_date: new Date('1925-06-15'),
                notes: 'Married in Boston after immigrating from Ireland'
            }, { transaction });
            
            await Relationship.create({
                person1_id: robertJohnson.person_id,
                person2_id: elizabethJohnson.person_id,
                relationship_type: 'spouse',
                start_date: new Date('1932-04-10'),
                notes: 'Married in Chicago'
            }, { transaction });
            
            await Relationship.create({
                person1_id: johnSmithJr.person_id,
                person2_id: margaretSmith.person_id,
                relationship_type: 'spouse',
                start_date: new Date('1960-09-03'),
                notes: 'Married in Boston'
            }, { transaction });
            
            // Parent-child relationships - Generation 1 to 2
            await Relationship.create({
                person1_id: johnSmithSr.person_id,
                person2_id: johnSmithJr.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: marySmith.person_id,
                person2_id: johnSmithJr.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: johnSmithSr.person_id,
                person2_id: thomasSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: marySmith.person_id,
                person2_id: thomasSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: robertJohnson.person_id,
                person2_id: margaretSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: elizabethJohnson.person_id,
                person2_id: margaretSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: robertJohnson.person_id,
                person2_id: sarahMiller.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: elizabethJohnson.person_id,
                person2_id: sarahMiller.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            // Parent-child relationships - Generation 2 to 3
            await Relationship.create({
                person1_id: johnSmithJr.person_id,
                person2_id: michaelSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: margaretSmith.person_id,
                person2_id: michaelSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: johnSmithJr.person_id,
                person2_id: jenniferDavis.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: margaretSmith.person_id,
                person2_id: jenniferDavis.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: johnSmithJr.person_id,
                person2_id: davidSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: margaretSmith.person_id,
                person2_id: davidSmith.person_id,
                relationship_type: 'parent',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            // Sibling relationships
            await Relationship.create({
                person1_id: johnSmithJr.person_id,
                person2_id: thomasSmith.person_id,
                relationship_type: 'sibling',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: margaretSmith.person_id,
                person2_id: sarahMiller.person_id,
                relationship_type: 'sibling',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: michaelSmith.person_id,
                person2_id: jenniferDavis.person_id,
                relationship_type: 'sibling',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: michaelSmith.person_id,
                person2_id: davidSmith.person_id,
                relationship_type: 'sibling',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            await Relationship.create({
                person1_id: jenniferDavis.person_id,
                person2_id: davidSmith.person_id,
                relationship_type: 'sibling',
                relationship_qualifier: 'biological'
            }, { transaction });
            
            // ===== EVENTS =====
            console.log('Creating life events...');
            
            // Immigration events
            await Event.create({
                person_id: johnSmithSr.person_id,
                event_type: 'immigration',
                event_date: new Date('1925-04-15'),
                event_location: 'Ellis Island, New York, USA',
                description: 'Arrived on the SS Celtic from Ireland'
            }, { transaction });
            
            await Event.create({
                person_id: marySmith.person_id,
                event_type: 'immigration',
                event_date: new Date('1925-04-15'),
                event_location: 'Ellis Island, New York, USA',
                description: 'Arrived on the SS Celtic from Ireland with husband John'
            }, { transaction });
            
            // Marriage events
            await Event.create({
                person_id: johnSmithSr.person_id,
                event_type: 'marriage',
                event_date: new Date('1925-06-15'),
                event_location: 'St. Patrick\'s Church, Boston, Massachusetts, USA',
                description: 'Marriage to Mary O\'Connor'
            }, { transaction });
            
            await Event.create({
                person_id: robertJohnson.person_id,
                event_type: 'marriage',
                event_date: new Date('1932-04-10'),
                event_location: 'First Presbyterian Church, Chicago, Illinois, USA',
                description: 'Marriage to Elizabeth Williams'
            }, { transaction });
            
            await Event.create({
                person_id: johnSmithJr.person_id,
                event_type: 'marriage',
                event_date: new Date('1960-09-03'),
                event_location: 'Holy Name Church, Boston, Massachusetts, USA',
                description: 'Marriage to Margaret Johnson'
            }, { transaction });
            
            // Military service
            await Event.create({
                person_id: johnSmithSr.person_id,
                event_type: 'military_service',
                event_date: new Date('1942-06-10'),
                event_location: 'U.S. Army',
                description: 'Enlisted in the U.S. Army during World War II'
            }, { transaction });
            
            await Event.create({
                person_id: johnSmithJr.person_id,
                event_type: 'military_service',
                event_date: new Date('1955-03-15'),
                event_location: 'U.S. Army',
                description: 'Served in the Korean War'
            }, { transaction });
            
            // Census records
            await Event.create({
                person_id: johnSmithSr.person_id,
                event_type: 'census',
                event_date: new Date('1930-04-01'),
                event_location: 'Boston, Massachusetts, USA',
                description: '1930 United States Federal Census'
            }, { transaction });
            
            await Event.create({
                person_id: marySmith.person_id,
                event_type: 'census',
                event_date: new Date('1930-04-01'),
                event_location: 'Boston, Massachusetts, USA',
                description: '1930 United States Federal Census'
            }, { transaction });
            
            // ===== DOCUMENTS =====
            console.log('Creating documents...');
            
            // Immigration records
            const immigrationDoc = await Document.create({
                title: 'Smith Family Immigration Records',
                document_type: 'record',
                file_path: '/documents/smith_immigration_1925.pdf',
                description: 'Ship manifest and immigration records for John and Mary Smith',
                source: 'National Archives',
                date_of_original: new Date('1925-04-15')
            }, { transaction });
            
            // Birth certificates
            const johnSrBirthCert = await Document.create({
                title: 'John Patrick Smith Sr. Birth Certificate',
                document_type: 'certificate',
                file_path: '/documents/john_sr_birth_certificate.pdf',
                description: 'Birth certificate from Dublin, Ireland',
                source: 'Dublin Registry Office',
                date_of_original: new Date('1905-03-15')
            }, { transaction });
            
            const johnJrBirthCert = await Document.create({
                title: 'John Michael Smith Jr. Birth Certificate',
                document_type: 'certificate',
                file_path: '/documents/john_jr_birth_certificate.pdf',
                description: 'Birth certificate from Boston, Massachusetts',
                source: 'Massachusetts Department of Public Health',
                date_of_original: new Date('1935-08-12')
            }, { transaction });
            
            // Marriage certificates
            const johnMaryMarriageCert = await Document.create({
                title: 'John and Mary Smith Marriage Certificate',
                document_type: 'certificate',
                file_path: '/documents/john_mary_marriage_certificate.pdf',
                description: 'Marriage certificate from Boston, Massachusetts',
                source: 'Massachusetts Registry of Vital Records',
                date_of_original: new Date('1925-06-15')
            }, { transaction });
            
            // Census records
            const census1930Doc = await Document.create({
                title: '1930 Census - Smith Family',
                document_type: 'census',
                file_path: '/documents/1930_census_smith.pdf',
                description: '1930 United States Federal Census record for the Smith family',
                source: 'National Archives',
                date_of_original: new Date('1930-04-01')
            }, { transaction });
            
            // Military records
            const militaryRecordDoc = await Document.create({
                title: 'John Smith Sr. Military Service Record',
                document_type: 'military',
                file_path: '/documents/john_sr_military_record.pdf',
                description: 'World War II service record for John Smith Sr.',
                source: 'U.S. Department of Defense',
                date_of_original: new Date('1945-12-20')
            }, { transaction });
            
            // Family photos
            const familyPhotoDoc = await Document.create({
                title: 'Smith Family Photo - 1950',
                document_type: 'photo',
                file_path: '/documents/smith_family_1950.jpg',
                description: 'Family photograph taken at Christmas 1950',
                date_of_original: new Date('1950-12-25')
            }, { transaction });
            
            // ===== DOCUMENT-PERSON ASSOCIATIONS =====
            console.log('Creating document-person associations...');
            
            // Link immigration document to John Sr. and Mary
            await DocumentPerson.create({
                document_id: immigrationDoc.document_id,
                person_id: johnSmithSr.person_id
            }, { transaction });
            
            await DocumentPerson.create({
                document_id: immigrationDoc.document_id,
                person_id: marySmith.person_id
            }, { transaction });
            
            // Link birth certificates to respective people
            await DocumentPerson.create({
                document_id: johnSrBirthCert.document_id,
                person_id: johnSmithSr.person_id
            }, { transaction });
            
            await DocumentPerson.create({
                document_id: johnJrBirthCert.document_id,
                person_id: johnSmithJr.person_id
            }, { transaction });
            
            // Link marriage certificate to both spouses
            await DocumentPerson.create({
                document_id: johnMaryMarriageCert.document_id,
                person_id: johnSmithSr.person_id
            }, { transaction });
            
            await DocumentPerson.create({
                document_id: johnMaryMarriageCert.document_id,
                person_id: marySmith.person_id
            }, { transaction });
            
            // Link census record to family members
            await DocumentPerson.create({
                document_id: census1930Doc.document_id,
                person_id: johnSmithSr.person_id
            }, { transaction });
            
            await DocumentPerson.create({
                document_id: census1930Doc.document_id,
                person_id: marySmith.person_id
            }, { transaction });
            
            // Link military record to John Sr.
            await DocumentPerson.create({
                document_id: militaryRecordDoc.document_id,
                person_id: johnSmithSr.person_id
            }, { transaction });
            
            // Link family photo to all family members
            await DocumentPerson.create({
                document_id: familyPhotoDoc.document_id,
                person_id: johnSmithSr.person_id
            }, { transaction });
            
            await DocumentPerson.create({
                document_id: familyPhotoDoc.document_id,
                person_id: marySmith.person_id
            }, { transaction });
            
            await DocumentPerson.create({
                document_id: familyPhotoDoc.document_id,
                person_id: johnSmithJr.person_id
            }, { transaction });
            
            console.log('Family data added successfully');

            // Commit the transaction
            await transaction.commit();
            console.log('Database seeding completed successfully');
        } catch (error) {
            // Rollback the transaction if there was an error
            await transaction.rollback();
            throw error; // Re-throw to be caught by the outer catch block
        }

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Ensure all connections are closed
        try {
            if (adminSequelize && adminSequelize.close) {
                await adminSequelize.close();
            }
            if (sequelize && sequelize.close) {
                await sequelize.close();
            }
        } catch (e) {
            console.error('Error closing database connections:', e);
        }
        console.log('Database connections closed');
    }
}

// Execute the seed function
seedDatabase();
