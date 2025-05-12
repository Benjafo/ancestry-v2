const { Event, PersonEvent, ProjectEvent } = require('../models');

/**
 * Seeds the events table and related junction tables
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing persons and project
 * @param {Object} params.persons - Object containing all person entities
 * @param {Object} params.project1 - The main project
 * @returns {Promise<Object>} Created events
 */
async function seedEvents(transaction, { persons, project1 }) {
    console.log('Creating life events...');
    
    // Destructure persons object for easier access
    const {
        johnSmithSr,
        marySmith,
        robertJohnson,
        elizabethJohnson,
        johnSmithJr,
        margaretSmith
    } = persons;
    
    // Create project events
    const arrivalEvent = await Event.create({
        event_type: 'immigration',
        event_date: new Date('1892-04-15'),
        event_location: 'Ellis Island, New York, USA',
        description: 'First Smith family members arrived in the United States through Ellis Island'
    }, { transaction });

    const settlementEvent = await Event.create({
        event_type: 'residence',
        event_date: new Date('1895-06-22'),
        event_location: 'Boston, Massachusetts, USA',
        description: 'Smith family established their first home in Boston, Massachusetts'
    }, { transaction });
    
    // Link events to project
    await ProjectEvent.create({
        project_id: project1.id,
        event_id: arrivalEvent.event_id
    }, { transaction });
    
    await ProjectEvent.create({
        project_id: project1.id,
        event_id: settlementEvent.event_id
    }, { transaction });
    
    // Immigration events
    const johnImmigrationEvent = await Event.create({
        event_type: 'immigration',
        event_date: new Date('1925-04-15'),
        event_location: 'Ellis Island, New York, USA',
        description: 'Arrived on the SS Celtic from Ireland'
    }, { transaction });
    
    const maryImmigrationEvent = await Event.create({
        event_type: 'immigration',
        event_date: new Date('1925-04-15'),
        event_location: 'Ellis Island, New York, USA',
        description: 'Arrived on the SS Celtic from Ireland with husband John'
    }, { transaction });
    
    // Link immigration events to persons
    await PersonEvent.create({
        person_id: johnSmithSr.person_id,
        event_id: johnImmigrationEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: marySmith.person_id,
        event_id: maryImmigrationEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    // Link immigration events to project
    await ProjectEvent.create({
        project_id: project1.id,
        event_id: johnImmigrationEvent.event_id
    }, { transaction });
    
    await ProjectEvent.create({
        project_id: project1.id,
        event_id: maryImmigrationEvent.event_id
    }, { transaction });
    
    // Marriage events
    const johnMaryMarriageEvent = await Event.create({
        event_type: 'marriage',
        event_date: new Date('1925-06-15'),
        event_location: 'St. Patrick\'s Church, Boston, Massachusetts, USA',
        description: 'Marriage of John Smith and Mary O\'Connor'
    }, { transaction });
    
    const robertElizabethMarriageEvent = await Event.create({
        event_type: 'marriage',
        event_date: new Date('1932-04-10'),
        event_location: 'First Presbyterian Church, Chicago, Illinois, USA',
        description: 'Marriage of Robert Johnson and Elizabeth Williams'
    }, { transaction });
    
    const johnJrMargaretMarriageEvent = await Event.create({
        event_type: 'marriage',
        event_date: new Date('1960-09-03'),
        event_location: 'Holy Name Church, Boston, Massachusetts, USA',
        description: 'Marriage of John Smith Jr. and Margaret Johnson'
    }, { transaction });
    
    // Link marriage events to persons
    await PersonEvent.create({
        person_id: johnSmithSr.person_id,
        event_id: johnMaryMarriageEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: marySmith.person_id,
        event_id: johnMaryMarriageEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: robertJohnson.person_id,
        event_id: robertElizabethMarriageEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: elizabethJohnson.person_id,
        event_id: robertElizabethMarriageEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: johnSmithJr.person_id,
        event_id: johnJrMargaretMarriageEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: margaretSmith.person_id,
        event_id: johnJrMargaretMarriageEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    // Link marriage events to project
    await ProjectEvent.create({
        project_id: project1.id,
        event_id: johnMaryMarriageEvent.event_id
    }, { transaction });
    
    // Military service events
    const johnSrMilitaryEvent = await Event.create({
        event_type: 'military_service',
        event_date: new Date('1942-06-10'),
        event_location: 'U.S. Army',
        description: 'Enlisted in the U.S. Army during World War II'
    }, { transaction });
    
    const johnJrMilitaryEvent = await Event.create({
        event_type: 'military_service',
        event_date: new Date('1955-03-15'),
        event_location: 'U.S. Army',
        description: 'Served in the Korean War'
    }, { transaction });
    
    // Link military events to persons
    await PersonEvent.create({
        person_id: johnSmithSr.person_id,
        event_id: johnSrMilitaryEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: johnSmithJr.person_id,
        event_id: johnJrMilitaryEvent.event_id,
        role: 'primary'
    }, { transaction });
    
    // Census records events
    const census1930Event = await Event.create({
        event_type: 'census',
        event_date: new Date('1930-04-01'),
        event_location: 'Boston, Massachusetts, USA',
        description: '1930 United States Federal Census'
    }, { transaction });
    
    // Link census event to persons
    await PersonEvent.create({
        person_id: johnSmithSr.person_id,
        event_id: census1930Event.event_id,
        role: 'primary'
    }, { transaction });
    
    await PersonEvent.create({
        person_id: marySmith.person_id,
        event_id: census1930Event.event_id,
        role: 'primary'
    }, { transaction });
    
    // Link census event to project
    await ProjectEvent.create({
        project_id: project1.id,
        event_id: census1930Event.event_id
    }, { transaction });
    
    console.log('Events created successfully');
    
    return {
        arrivalEvent,
        settlementEvent,
        johnImmigrationEvent,
        maryImmigrationEvent,
        johnMaryMarriageEvent,
        robertElizabethMarriageEvent,
        johnJrMargaretMarriageEvent,
        johnSrMilitaryEvent,
        johnJrMilitaryEvent,
        census1930Event
    };
}

module.exports = seedEvents;
