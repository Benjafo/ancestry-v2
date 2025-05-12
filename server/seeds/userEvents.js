const { UserEvent } = require('../models');

/**
 * Seeds the user_events table
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing users, projects, persons, events, and documents
 * @param {Object} params.adminUser - Admin user
 * @param {Object} params.clientUser - Client user
 * @param {Object} params.project1 - The main project
 * @param {Object} params.persons - Object containing all person entities
 * @param {Object} params.events - Object containing all event entities
 * @param {Object} params.documents - Object containing all document entities
 * @returns {Promise<Object>} Created user events
 */
async function seedUserEvents(transaction, { adminUser, clientUser, project1, persons, events, documents }) {
    console.log('Creating user events...');
    
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
    
    // ===== USER EVENTS FOR CLIENT =====
    console.log('Creating user events for client...');
    
    const clientEvents = [];
    
    // Project assignment event
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'project_assigned',
        message: `You've been assigned to a new project: ${project1.title}`,
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    // Document addition events
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'document_added',
        message: `A new document has been added to your project: ${immigrationDoc.title}`,
        entity_id: immigrationDoc.document_id,
        entity_type: 'document'
    }, { transaction }));
    
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'document_added',
        message: `A new document has been added to your project: ${johnSrBirthCert.title}`,
        entity_id: johnSrBirthCert.document_id,
        entity_type: 'document'
    }, { transaction }));
    
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'document_added',
        message: `A new document has been added to your project: ${johnMaryMarriageCert.title}`,
        entity_id: johnMaryMarriageCert.document_id,
        entity_type: 'document'
    }, { transaction }));
    
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'document_added',
        message: `A new document has been added to your project: ${familyPhotoDoc.title}`,
        entity_id: familyPhotoDoc.document_id,
        entity_type: 'document'
    }, { transaction }));
    
    // Research update events
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'person_discovered',
        message: `New family member discovered: ${marySmith.first_name} ${marySmith.last_name}`,
        entity_id: marySmith.person_id,
        entity_type: 'person'
    }, { transaction }));
    
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'event_recorded',
        message: `New event recorded: Immigration to ${johnImmigrationEvent.event_location}`,
        entity_id: johnImmigrationEvent.event_id,
        entity_type: 'event'
    }, { transaction }));
    
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'relationship_established',
        message: `New relationship established: ${johnSmithSr.first_name} and ${marySmith.first_name} ${marySmith.last_name} (Marriage)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    // Research milestone events
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'research_milestone',
        message: 'First generation of Smith family documented',
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    clientEvents.push(await UserEvent.create({
        user_id: clientUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'research_milestone',
        message: 'Immigration records verified',
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    // ===== USER EVENTS FOR ADMIN =====
    console.log('Creating user events for admin...');
    
    const adminEvents = [];
    
    // Project management events
    adminEvents.push(await UserEvent.create({
        user_id: adminUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'project_created',
        message: `Created project: ${project1.title}`,
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    adminEvents.push(await UserEvent.create({
        user_id: adminUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'project_assigned',
        message: `Assigned client to project: ${project1.title}`,
        entity_id: project1.id,
        entity_type: 'project'
    }, { transaction }));
    
    // Person management events
    const personList = [
        { person: johnSmithSr, message: `Added person: ${johnSmithSr.first_name} ${johnSmithSr.middle_name} ${johnSmithSr.last_name}` },
        { person: marySmith, message: `Added person: ${marySmith.first_name} ${marySmith.last_name}` },
        { person: johnSmithJr, message: `Added person: ${johnSmithJr.first_name} ${johnSmithJr.middle_name} ${johnSmithJr.last_name}` },
        { person: margaretSmith, message: `Added person: ${margaretSmith.first_name} ${margaretSmith.last_name}` },
        { person: thomasSmith, message: `Added person: ${thomasSmith.first_name} ${thomasSmith.middle_name} ${thomasSmith.last_name}` },
        { person: michaelSmith, message: `Added person: ${michaelSmith.first_name} ${michaelSmith.middle_name} ${michaelSmith.last_name}` },
        { person: jenniferDavis, message: `Added person: ${jenniferDavis.first_name} ${jenniferDavis.last_name}` },
        { person: davidSmith, message: `Added person: ${davidSmith.first_name} ${davidSmith.middle_name} ${davidSmith.last_name}` }
    ];
    
    for (const { person, message } of personList) {
        adminEvents.push(await UserEvent.create({
            user_id: adminUser.user_id,
            actor_id: adminUser.user_id,
            event_type: 'person_created',
            message,
            entity_id: person.person_id,
            entity_type: 'person'
        }, { transaction }));
    }
    
    // Document management events
    const documentList = [
        { document: immigrationDoc, message: `Uploaded document: ${immigrationDoc.title}` },
        { document: johnSrBirthCert, message: `Uploaded document: ${johnSrBirthCert.title}` },
        { document: johnJrBirthCert, message: `Uploaded document: ${johnJrBirthCert.title}` },
        { document: johnMaryMarriageCert, message: `Uploaded document: ${johnMaryMarriageCert.title}` },
        { document: census1930Doc, message: `Uploaded document: ${census1930Doc.title}` },
        { document: militaryRecordDoc, message: `Uploaded document: ${militaryRecordDoc.title}` },
        { document: familyPhotoDoc, message: `Uploaded document: ${familyPhotoDoc.title}` }
    ];
    
    for (const { document, message } of documentList) {
        adminEvents.push(await UserEvent.create({
            user_id: adminUser.user_id,
            actor_id: adminUser.user_id,
            event_type: 'document_uploaded',
            message,
            entity_id: document.document_id,
            entity_type: 'document'
        }, { transaction }));
    }
    
    // Event recording events
    const eventList = [
        { event: johnImmigrationEvent, message: `Recorded event: Immigration (1925) for ${johnSmithSr.first_name} ${johnSmithSr.last_name}` },
        { event: maryImmigrationEvent, message: `Recorded event: Immigration (1925) for ${marySmith.first_name} ${marySmith.last_name}` },
        { event: johnMaryMarriageEvent, message: `Recorded event: Marriage (1925) for ${johnSmithSr.first_name} and ${marySmith.first_name} ${marySmith.last_name}` },
        { event: johnSrMilitaryEvent, message: `Recorded event: Military Service (1942) for ${johnSmithSr.first_name} ${johnSmithSr.last_name}` },
        { event: census1930Event, message: `Recorded event: Census Record (1930) for Smith Family` }
    ];
    
    for (const { event, message } of eventList) {
        adminEvents.push(await UserEvent.create({
            user_id: adminUser.user_id,
            actor_id: adminUser.user_id,
            event_type: 'event_recorded',
            message,
            entity_id: event.event_id,
            entity_type: 'event'
        }, { transaction }));
    }
    
    // Relationship management events
    adminEvents.push(await UserEvent.create({
        user_id: adminUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'relationship_created',
        message: `Established relationship: ${johnSmithSr.first_name} ${johnSmithSr.last_name} and ${marySmith.first_name} ${marySmith.last_name} (Spouse)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    adminEvents.push(await UserEvent.create({
        user_id: adminUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'relationship_created',
        message: `Established relationship: ${johnSmithSr.first_name} ${johnSmithSr.last_name} and ${johnSmithJr.first_name} ${johnSmithJr.last_name} (Parent)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    adminEvents.push(await UserEvent.create({
        user_id: adminUser.user_id,
        actor_id: adminUser.user_id,
        event_type: 'relationship_created',
        message: `Established relationship: ${marySmith.first_name} ${marySmith.last_name} and ${johnSmithJr.first_name} ${johnSmithJr.last_name} (Parent)`,
        entity_type: 'relationship'
    }, { transaction }));
    
    // Set sequential timestamps for all events
    const allEvents = [...clientEvents, ...adminEvents];
    for (let i = 0; i < allEvents.length; i++) {
        allEvents[i].created_at = new Date(baseDate.getTime() + i * 60 * 60 * 1000); // +1 hour increments
        await allEvents[i].save({ transaction });
    }
    
    console.log('User events created successfully');
    
    return {
        clientEvents,
        adminEvents
    };
}

module.exports = seedUserEvents;
