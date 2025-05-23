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
async function seedUserEvents(transaction, { adminUser, clientUser, project1, project2, project3, persons, events, documents }) {
    console.log('Creating user events...');

    const clientEvents = [];
    const adminEvents = [];

    // Helper functions to create events
    async function createClientEvent(type, message, entityId = null, entityType = null) {
        return await UserEvent.create({
            user_id: clientUser.user_id,
            actor_id: adminUser.user_id,
            event_type: type,
            message,
            entity_id: entityId,
            entity_type: entityType
        }, { transaction });
    }

    async function createAdminEvent(type, message, entityId = null, entityType = null) {
        return await UserEvent.create({
            user_id: adminUser.user_id,
            actor_id: adminUser.user_id,
            event_type: type,
            message,
            entity_id: entityId,
            entity_type: entityType
        }, { transaction });
    }

    // ===== CLIENT USER EVENTS =====
    console.log('Creating user events for client...');

    // Project assignment event
    clientEvents.push(await createClientEvent(
        'project_assigned',
        `You've been assigned to a new project: ${project1.title}`,
        project1.id,
        'project'
    ));

    // Document addition events
    const documentAdditions = [
        { doc: documents.immigrationDoc, message: `A new document has been added to your project: ${documents.immigrationDoc.title}` },
        { doc: documents.johnSrBirthCert, message: `A new document has been added to your project: ${documents.johnSrBirthCert.title}` },
        { doc: documents.johnJrBirthCert, message: `A new document has been added to your project: ${documents.johnJrBirthCert.title}` },
        { doc: documents.johnMaryMarriageCert, message: `A new document has been added to your project: ${documents.johnMaryMarriageCert.title}` },
        { doc: documents.census1930Doc, message: `A new document has been added to your project: ${documents.census1930Doc.title}` },
        { doc: documents.militaryRecordDoc, message: `A new document has been added to your project: ${documents.militaryRecordDoc.title}` },
        { doc: documents.familyPhotoDoc, message: `A new document has been added to your project: ${documents.familyPhotoDoc.title}` }
    ];

    for (const { doc, message } of documentAdditions) {
        clientEvents.push(await createClientEvent(
            'document_created',
            message,
            doc.document_id,
            'document'
        ));
    }

    // // Person discovery events
    // const personDiscoveries = Object.entries(persons).map(([key, person]) => ({
    //     person,
    //     message: `New family member discovered: ${person.first_name} ${person.last_name}`
    // }));

    // for (const { person, message } of personDiscoveries) {
    //     clientEvents.push(await createClientEvent(
    //         'person_discovered',
    //         message,
    //         person.person_id,
    //         'person'
    //     ));
    // }

    // Event recording events
    const eventRecordings = [
        { event: events.johnImmigrationEvent, message: `New event recorded: Immigration to ${events.johnImmigrationEvent.event_location}` },
        { event: events.maryImmigrationEvent, message: `New event recorded: Immigration to ${events.maryImmigrationEvent.event_location}` },
        { event: events.johnMaryMarriageEvent, message: `New event recorded: Marriage at ${events.johnMaryMarriageEvent.event_location}` },
        { event: events.johnSrMilitaryEvent, message: `New event recorded: Military Service in ${events.johnSrMilitaryEvent.event_location}` },
        { event: events.census1930Event, message: `New event recorded: Census Record in ${events.census1930Event.event_location}` },
        { event: events.arrivalEvent, message: `New event recorded: Family Arrival at ${events.arrivalEvent.event_location}` },
        { event: events.settlementEvent, message: `New event recorded: Settlement in ${events.settlementEvent.event_location}` },
        { event: events.robertElizabethMarriageEvent, message: `New event recorded: Marriage at ${events.robertElizabethMarriageEvent.event_location}` },
        { event: events.johnJrMargaretMarriageEvent, message: `New event recorded: Marriage at ${events.johnJrMargaretMarriageEvent.event_location}` },
        { event: events.johnJrMilitaryEvent, message: `New event recorded: Military Service in ${events.johnJrMilitaryEvent.event_location}` }
    ];

    for (const { event, message } of eventRecordings) {
        clientEvents.push(await createClientEvent(
            'event_created',
            message,
            event.event_id,
            'event'
        ));
    }

    // Relationship events
    const relationshipEstablishments = [
        { p1: persons.johnSmithSr, p2: persons.marySmith, type: 'Marriage', message: `New relationship established: ${persons.johnSmithSr.first_name} and ${persons.marySmith.first_name} ${persons.marySmith.last_name} (Marriage)` },
        { p1: persons.johnSmithSr, p2: persons.johnSmithJr, type: 'Parent-Child', message: `New relationship established: ${persons.johnSmithSr.first_name} ${persons.johnSmithSr.last_name} and ${persons.johnSmithJr.first_name} ${persons.johnSmithJr.last_name} (Parent-Child)` },
        { p1: persons.marySmith, p2: persons.johnSmithJr, type: 'Parent-Child', message: `New relationship established: ${persons.marySmith.first_name} ${persons.marySmith.last_name} and ${persons.johnSmithJr.first_name} ${persons.johnSmithJr.last_name} (Parent-Child)` },
        { p1: persons.johnSmithSr, p2: persons.thomasSmith, type: 'Parent-Child', message: `New relationship established: ${persons.johnSmithSr.first_name} ${persons.johnSmithSr.last_name} and ${persons.thomasSmith.first_name} ${persons.thomasSmith.last_name} (Parent-Child)` },
        { p1: persons.marySmith, p2: persons.thomasSmith, type: 'Parent-Child', message: `New relationship established: ${persons.marySmith.first_name} ${persons.marySmith.last_name} and ${persons.thomasSmith.first_name} ${persons.thomasSmith.last_name} (Parent-Child)` },
        { p1: persons.johnSmithJr, p2: persons.margaretSmith, type: 'Marriage', message: `New relationship established: ${persons.johnSmithJr.first_name} ${persons.johnSmithJr.last_name} and ${persons.margaretSmith.first_name} ${persons.margaretSmith.last_name} (Marriage)` },
        { p1: persons.johnSmithJr, p2: persons.michaelSmith, type: 'Parent-Child', message: `New relationship established: ${persons.johnSmithJr.first_name} ${persons.johnSmithJr.last_name} and ${persons.michaelSmith.first_name} ${persons.michaelSmith.last_name} (Parent-Child)` },
        { p1: persons.margaretSmith, p2: persons.michaelSmith, type: 'Parent-Child', message: `New relationship established: ${persons.margaretSmith.first_name} ${persons.margaretSmith.last_name} and ${persons.michaelSmith.first_name} ${persons.michaelSmith.last_name} (Parent-Child)` },
        { p1: persons.robertJohnson, p2: persons.elizabethJohnson, type: 'Marriage', message: `New relationship established: ${persons.robertJohnson.first_name} ${persons.robertJohnson.last_name} and ${persons.elizabethJohnson.first_name} ${persons.elizabethJohnson.last_name} (Marriage)` },
        { p1: persons.robertJohnson, p2: persons.margaretSmith, type: 'Parent-Child', message: `New relationship established: ${persons.robertJohnson.first_name} ${persons.robertJohnson.last_name} and ${persons.margaretSmith.first_name} ${persons.margaretSmith.last_name} (Parent-Child)` },
        { p1: persons.elizabethJohnson, p2: persons.margaretSmith, type: 'Parent-Child', message: `New relationship established: ${persons.elizabethJohnson.first_name} ${persons.elizabethJohnson.last_name} and ${persons.margaretSmith.first_name} ${persons.margaretSmith.last_name} (Parent-Child)` }
    ];

    for (const { message } of relationshipEstablishments) {
        clientEvents.push(await createClientEvent(
            'relationship_created',
            message,
            null,
            'relationship'
        ));
    }

    // Research milestone events
    const researchMilestones = [
        'First generation of Smith family documented',
        'Immigration records verified',
        'Second generation of Smith family documented',
        'Third generation of Smith family documented',
        'Military service records verified'
    ];

    for (const message of researchMilestones) {
        clientEvents.push(await createClientEvent(
            'research_milestone',
            message,
            project1.id,
            'project'
        ));
    }

    // // Project updates
    // const projectUpdates = [
    //     'New research findings added to your project',
    //     'Timeline updated with new events'
    // ];

    // for (const message of projectUpdates) {
    //     clientEvents.push(await createClientEvent(
    //         'project_update',
    //         message,
    //         project1.id,
    //         'project'
    //     ));
    // }

    // ===== ADMIN USER EVENTS =====
    console.log('Creating user events for admin...');

    // Project management events
    const projectManagement = [
        { project: project1, type: 'project_created', message: `Created project: ${project1.title}` },
        { project: project2, type: 'project_created', message: `Created project: ${project2.title}` },
        { project: project3, type: 'project_created', message: `Created project: ${project3.title}` },
        { project: project1, type: 'project_assigned', message: `Assigned client to project: ${project1.title}` },
        { project: project3, type: 'project_updated', message: `Updated project status: ${project3.title} set to on_hold` }
    ];

    for (const { project, type, message } of projectManagement) {
        adminEvents.push(await createAdminEvent(
            type,
            message,
            project.id,
            'project'
        ));
    }

    // Person management events
    const personManagement = [
        { person: persons.johnSmithSr, message: `Added person: ${persons.johnSmithSr.first_name} ${persons.johnSmithSr.middle_name} ${persons.johnSmithSr.last_name}` },
        { person: persons.marySmith, message: `Added person: ${persons.marySmith.first_name} ${persons.marySmith.last_name}` },
        { person: persons.johnSmithJr, message: `Added person: ${persons.johnSmithJr.first_name} ${persons.johnSmithJr.middle_name} ${persons.johnSmithJr.last_name}` },
        { person: persons.margaretSmith, message: `Added person: ${persons.margaretSmith.first_name} ${persons.margaretSmith.last_name}` },
        { person: persons.thomasSmith, message: `Added person: ${persons.thomasSmith.first_name} ${persons.thomasSmith.middle_name} ${persons.thomasSmith.last_name}` },
        { person: persons.michaelSmith, message: `Added person: ${persons.michaelSmith.first_name} ${persons.michaelSmith.middle_name} ${persons.michaelSmith.last_name}` },
        { person: persons.jenniferDavis, message: `Added person: ${persons.jenniferDavis.first_name} ${persons.jenniferDavis.last_name}` },
        { person: persons.davidSmith, message: `Added person: ${persons.davidSmith.first_name} ${persons.davidSmith.middle_name} ${persons.davidSmith.last_name}` },
        { person: persons.robertJohnson, message: `Added person: ${persons.robertJohnson.first_name} ${persons.robertJohnson.middle_name} ${persons.robertJohnson.last_name}` },
        { person: persons.elizabethJohnson, message: `Added person: ${persons.elizabethJohnson.first_name} ${persons.elizabethJohnson.last_name}` },
        { person: persons.sarahMiller, message: `Added person: ${persons.sarahMiller.first_name} ${persons.sarahMiller.last_name}` }
    ];

    for (const { person, message } of personManagement) {
        adminEvents.push(await createAdminEvent(
            'person_created',
            message,
            person.person_id,
            'person'
        ));
    }

    // Document management events
    const documentManagement = [
        { doc: documents.immigrationDoc, message: `Uploaded document: ${documents.immigrationDoc.title}` },
        { doc: documents.johnSrBirthCert, message: `Uploaded document: ${documents.johnSrBirthCert.title}` },
        { doc: documents.johnJrBirthCert, message: `Uploaded document: ${documents.johnJrBirthCert.title}` },
        { doc: documents.johnMaryMarriageCert, message: `Uploaded document: ${documents.johnMaryMarriageCert.title}` },
        { doc: documents.census1930Doc, message: `Uploaded document: ${documents.census1930Doc.title}` },
        { doc: documents.militaryRecordDoc, message: `Uploaded document: ${documents.militaryRecordDoc.title}` },
        { doc: documents.familyPhotoDoc, message: `Uploaded document: ${documents.familyPhotoDoc.title}` }
    ];

    for (const { doc, message } of documentManagement) {
        adminEvents.push(await createAdminEvent(
            'document_created',
            message,
            doc.document_id,
            'document'
        ));
    }

    // Event recording events for admin
    const adminEventRecordings = [
        { event: events.johnImmigrationEvent, message: `Recorded event: Immigration (1925) for ${persons.johnSmithSr.first_name} ${persons.johnSmithSr.last_name}` },
        { event: events.maryImmigrationEvent, message: `Recorded event: Immigration (1925) for ${persons.marySmith.first_name} ${persons.marySmith.last_name}` },
        { event: events.johnMaryMarriageEvent, message: `Recorded event: Marriage (1925) for ${persons.johnSmithSr.first_name} and ${persons.marySmith.first_name} ${persons.marySmith.last_name}` },
        { event: events.johnSrMilitaryEvent, message: `Recorded event: Military Service (1942) for ${persons.johnSmithSr.first_name} ${persons.johnSmithSr.last_name}` },
        { event: events.census1930Event, message: `Recorded event: Census Record (1930) for Smith Family` },
        { event: events.arrivalEvent, message: `Recorded event: Family Arrival (1892) at ${events.arrivalEvent.event_location}` },
        { event: events.settlementEvent, message: `Recorded event: Settlement (1895) in ${events.settlementEvent.event_location}` },
        { event: events.robertElizabethMarriageEvent, message: `Recorded event: Marriage (1932) for ${persons.robertJohnson.first_name} and ${persons.elizabethJohnson.first_name} ${persons.elizabethJohnson.last_name}` },
        { event: events.johnJrMargaretMarriageEvent, message: `Recorded event: Marriage (1960) for ${persons.johnSmithJr.first_name} and ${persons.margaretSmith.first_name} ${persons.margaretSmith.last_name}` },
        { event: events.johnJrMilitaryEvent, message: `Recorded event: Military Service (1955) for ${persons.johnSmithJr.first_name} ${persons.johnSmithJr.last_name}` }
    ];

    for (const { event, message } of adminEventRecordings) {
        adminEvents.push(await createAdminEvent(
            'event_created',
            message,
            event.event_id,
            'event'
        ));
    }

    // Relationship management events for admin
    for (const { message } of relationshipEstablishments) {
        adminEvents.push(await createAdminEvent(
            'relationship_created',
            message.replace('New relationship established', 'Established relationship'),
            null,
            'relationship'
        ));
    }

    console.log(`Created ${clientEvents.length} client events and ${adminEvents.length} admin events`);

    return {
        clientEvents,
        adminEvents
    };
}

module.exports = seedUserEvents;
