const { Person, ProjectPerson } = require('../models');

/**
 * Seeds the persons table and project-person associations
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing project
 * @param {Object} params.project1 - The main project
 * @returns {Promise<Object>} Created persons
 */
async function seedPersons(transaction, { project1 }) {
    console.log('Adding family data...');
    
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
    
    console.log('Persons created successfully');
    
    // Link persons to projects
    console.log('Linking persons to projects...');
    
    // Link Smith family members to the Smith Family Immigration Records project
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: johnSmithSr.person_id,
        notes: 'Primary subject of research'
    }, { transaction });
    
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: marySmith.person_id,
        notes: 'Primary subject of research'
    }, { transaction });
    
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: johnSmithJr.person_id,
        notes: 'Son of John and Mary Smith'
    }, { transaction });
    
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: thomasSmith.person_id,
        notes: 'Son of John and Mary Smith'
    }, { transaction });
    
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: michaelSmith.person_id,
        notes: 'Grandson of John and Mary Smith'
    }, { transaction });
    
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: jenniferDavis.person_id,
        notes: 'Granddaughter of John and Mary Smith'
    }, { transaction });
    
    await ProjectPerson.create({
        project_id: project1.id,
        person_id: davidSmith.person_id,
        notes: 'Grandson of John and Mary Smith'
    }, { transaction });
    
    console.log('Project-person associations created successfully');

    return {
        johnSmithSr,
        marySmith,
        robertJohnson,
        elizabethJohnson,
        johnSmithJr,
        margaretSmith,
        thomasSmith,
        sarahMiller,
        michaelSmith,
        jenniferDavis,
        davidSmith
    };
}

module.exports = seedPersons;
