const { Notification, Activity } = require('../models');

/**
 * Seeds the notifications and activities tables
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing users, projects, persons, events, and documents
 * @param {Object} params.adminUser - Admin user
 * @param {Object} params.clientUser - Client user
 * @param {Object} params.project1 - The main project
 * @param {Object} params.persons - Object containing all person entities
 * @param {Object} params.events - Object containing all event entities
 * @param {Object} params.documents - Object containing all document entities
 * @returns {Promise<Object>} Created notifications and activities
 */
async function seedNotificationsActivities(transaction, { adminUser, clientUser, project1, persons, events, documents }) {
    console.log('Creating notifications and activities...');
    
    // Destructure persons, events, and documents for easier access
    const {
        johnSmithSr,
        marySmith,
        johnSmithJr,
        margaretSmith,
        thomasSmith,
        michaelSmith,
        jenniferDavis,
        davidSmith
    } = persons;
    
    const {
        johnImmigrationEvent,
        maryImmigrationEvent,
        johnMaryMarriageEvent,
        johnSrMilitaryEvent,
        census1930Event
    } = events;
    
    const {
        immigrationDoc,
        johnSrBirthCert,
        johnJrBirthCert,
        johnMaryMarriageCert,
        census1930Doc,
        militaryRecordDoc,
        familyPhotoDoc
    } = documents;
    
    // Create base date for sequential timestamps
    const baseDate = new Date('2025-01-01T10:00:00');
    
    // ===== NOTIFICATIONS =====
    console.log('Creating notifications...');
    
    // Project assignment notification
    const projectAssignmentNotification = await Notification.create({
        user_id: clientUser.user_id,
        title: 'New Project Assignment',
        message: `You've been assigned to a new project: ${project1.title}`,
        is_read: false
    }, { transaction });
    projectAssignmentNotification.created_at = new Date(baseDate.getTime() + 1 * 60 * 60 * 1000); // +1 hour
    await projectAssignmentNotification.save({ transaction });
    
    // Document addition notifications
    const documentNotifications = [];
    
    documentNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'New Document Added',
        message: `A new document has been added to your project: ${immigrationDoc.title}`,
        is_read: false
    }, { transaction }));
    
    documentNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'New Document Added',
        message: `A new document has been added to your project: ${johnSrBirthCert.title}`,
        is_read: true
    }, { transaction }));
    
    documentNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'New Document Added',
        message: `A new document has been added to your project: ${johnMaryMarriageCert.title}`,
        is_read: false
    }, { transaction }));
    
    documentNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'New Document Added',
        message: `A new document has been added to your project: ${familyPhotoDoc.title}`,
        is_read: true
    }, { transaction }));
    
    // Set sequential timestamps for document notifications
    for (let i = 0; i < documentNotifications.length; i++) {
        documentNotifications[i].created_at = new Date(baseDate.getTime() + (2 + i) * 60 * 60 * 1000); // +2, +3, +4, +5 hours
        await documentNotifications[i].save({ transaction });
    }
    
    // Research update notifications
    const researchNotifications = [];
    
    researchNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'Research Update',
        message: `New family member discovered: ${marySmith.first_name} ${marySmith.last_name}`,
        is_read: false
    }, { transaction }));
    
    researchNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'Research Update',
        message: `New event recorded: Immigration to ${johnImmigrationEvent.event_location}`,
        is_read: true
    }, { transaction }));
    
    researchNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'Research Update',
        message: `New relationship established: ${johnSmithSr.first_name} and ${marySmith.first_name} ${marySmith.last_name} (Marriage)`,
        is_read: false
    }, { transaction }));
    
    // Set sequential timestamps for research notifications
    for (let i = 0; i < researchNotifications.length; i++) {
        researchNotifications[i].created_at = new Date(baseDate.getTime() + (6 + i) * 60 * 60 * 1000); // +6, +7, +8 hours
        await researchNotifications[i].save({ transaction });
    }
    
    // Research milestone notifications
    const milestoneNotifications = [];
    
    milestoneNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'Research Milestone',
        message: 'First generation of Smith family documented',
        is_read: true
    }, { transaction }));
    
    milestoneNotifications.push(await Notification.create({
        user_id: clientUser.user_id,
        title: 'Research Milestone',
        message: 'Immigration records verified',
        is_read: false
    }, { transaction }));
    
    // Set sequential timestamps for milestone notifications
    for (let i = 0; i < milestoneNotifications.length; i++) {
        milestoneNotifications[i].created_at = new Date(baseDate.getTime() + (9 + i) * 60 * 60 * 1000); // +9, +10 hours
        await milestoneNotifications[i].save({ transaction });
    }
    
    // ===== ACTIVITIES =====
    console.log('Creating activities...');
    
    // Project management activities
    const projectActivities = [];
    
    projectActivities.push(await Activity.create({
        user_id: adminUser.user_id,
        type: 'project_creation',
        description: `Created project: ${project1.title}`,
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    projectActivities.push(await Activity.create({
        user_id: adminUser.user_id,
        type: 'project_assignment',
        description: `Assigned client to project: ${project1.title}`,
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    // Set sequential timestamps for project activities
    for (let i = 0; i < projectActivities.length; i++) {
        projectActivities[i].created_at = new Date(baseDate.getTime() + (11 + i) * 60 * 60 * 1000); // +11, +12 hours
        await projectActivities[i].save({ transaction });
    }
    
    // Person management activities
    const personActivities = [];
    
    const personList = [
        { person: johnSmithSr, description: `Added person: ${johnSmithSr.first_name} ${johnSmithSr.middle_name} ${johnSmithSr.last_name}` },
        { person: marySmith, description: `Added person: ${marySmith.first_name} ${marySmith.last_name}` },
        { person: johnSmithJr, description: `Added person: ${johnSmithJr.first_name} ${johnSmithJr.middle_name} ${johnSmithJr.last_name}` },
        { person: margaretSmith, description: `Added person: ${margaretSmith.first_name} ${margaretSmith.last_name}` },
        { person: thomasSmith, description: `Added person: ${thomasSmith.first_name} ${thomasSmith.middle_name} ${thomasSmith.last_name}` },
        { person: michaelSmith, description: `Added person: ${michaelSmith.first_name} ${michaelSmith.middle_name} ${michaelSmith.last_name}` },
        { person: jenniferDavis, description: `Added person: ${jenniferDavis.first_name} ${jenniferDavis.last_name}` },
        { person: davidSmith, description: `Added person: ${davidSmith.first_name} ${davidSmith.middle_name} ${davidSmith.last_name}` }
    ];
    
    for (const { person, description } of personList) {
        personActivities.push(await Activity.create({
            user_id: adminUser.user_id,
            type: 'person_creation',
            description,
            entity_id: person.person_id,
            entity_type: 'person'
        }, { transaction }));
    }
    
    // Set sequential timestamps for person activities
    for (let i = 0; i < personActivities.length; i++) {
        personActivities[i].created_at = new Date(baseDate.getTime() + (13 + i) * 60 * 60 * 1000); // +13 to +20 hours
        await personActivities[i].save({ transaction });
    }
    
    // Document management activities
    const documentActivities = [];
    
    const documentList = [
        { document: immigrationDoc, description: `Uploaded document: ${immigrationDoc.title}` },
        { document: johnSrBirthCert, description: `Uploaded document: ${johnSrBirthCert.title}` },
        { document: johnJrBirthCert, description: `Uploaded document: ${johnJrBirthCert.title}` },
        { document: johnMaryMarriageCert, description: `Uploaded document: ${johnMaryMarriageCert.title}` },
        { document: census1930Doc, description: `Uploaded document: ${census1930Doc.title}` },
        { document: militaryRecordDoc, description: `Uploaded document: ${militaryRecordDoc.title}` },
        { document: familyPhotoDoc, description: `Uploaded document: ${familyPhotoDoc.title}` }
    ];
    
    for (const { document, description } of documentList) {
        documentActivities.push(await Activity.create({
            user_id: adminUser.user_id,
            type: 'document_upload',
            description,
            entity_id: document.document_id,
            entity_type: 'document'
        }, { transaction }));
    }
    
    // Set sequential timestamps for document activities
    for (let i = 0; i < documentActivities.length; i++) {
        documentActivities[i].created_at = new Date(baseDate.getTime() + (21 + i) * 60 * 60 * 1000); // +21 to +27 hours
        await documentActivities[i].save({ transaction });
    }
    
    // Event recording activities
    const eventActivities = [];
    
    const eventList = [
        { event: johnImmigrationEvent, description: `Recorded event: Immigration (1925) for ${johnSmithSr.first_name} ${johnSmithSr.last_name}` },
        { event: maryImmigrationEvent, description: `Recorded event: Immigration (1925) for ${marySmith.first_name} ${marySmith.last_name}` },
        { event: johnMaryMarriageEvent, description: `Recorded event: Marriage (1925) for ${johnSmithSr.first_name} and ${marySmith.first_name} ${marySmith.last_name}` },
        { event: johnSrMilitaryEvent, description: `Recorded event: Military Service (1942) for ${johnSmithSr.first_name} ${johnSmithSr.last_name}` },
        { event: census1930Event, description: `Recorded event: Census Record (1930) for Smith Family` }
    ];
    
    for (const { event, description } of eventList) {
        eventActivities.push(await Activity.create({
            user_id: adminUser.user_id,
            type: 'event_recording',
            description,
            entity_id: event.event_id,
            entity_type: 'event'
        }, { transaction }));
    }
    
    // Set sequential timestamps for event activities
    for (let i = 0; i < eventActivities.length; i++) {
        eventActivities[i].created_at = new Date(baseDate.getTime() + (28 + i) * 60 * 60 * 1000); // +28 to +32 hours
        await eventActivities[i].save({ transaction });
    }
    
    // Relationship management activities
    const relationshipActivities = [];
    
    relationshipActivities.push(await Activity.create({
        user_id: adminUser.user_id,
        type: 'relationship_creation',
        description: `Established relationship: ${johnSmithSr.first_name} ${johnSmithSr.last_name} and ${marySmith.first_name} ${marySmith.last_name} (Spouse)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    relationshipActivities.push(await Activity.create({
        user_id: adminUser.user_id,
        type: 'relationship_creation',
        description: `Established relationship: ${johnSmithSr.first_name} ${johnSmithSr.last_name} and ${johnSmithJr.first_name} ${johnSmithJr.last_name} (Parent)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    relationshipActivities.push(await Activity.create({
        user_id: adminUser.user_id,
        type: 'relationship_creation',
        description: `Established relationship: ${marySmith.first_name} ${marySmith.last_name} and ${johnSmithJr.first_name} ${johnSmithJr.last_name} (Parent)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    // Set sequential timestamps for relationship activities
    for (let i = 0; i < relationshipActivities.length; i++) {
        relationshipActivities[i].created_at = new Date(baseDate.getTime() + (33 + i) * 60 * 60 * 1000); // +33 to +35 hours
        await relationshipActivities[i].save({ transaction });
    }
    
    console.log('Notifications and activities created successfully');
    
    return {
        notifications: {
            projectAssignmentNotification,
            documentNotifications,
            researchNotifications,
            milestoneNotifications
        },
        activities: {
            projectActivities,
            personActivities,
            documentActivities,
            eventActivities,
            relationshipActivities
        }
    };
}

module.exports = seedNotificationsActivities;
