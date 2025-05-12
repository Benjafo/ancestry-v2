const { ProjectPerson } = require('../models');

/**
 * Seeds the project_persons table
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing persons and project
 * @param {Object} params.persons - Object containing all person entities
 * @param {Object} params.project1 - The main project
 * @returns {Promise<void>}
 */
async function seedProjectPersons(transaction, { persons, project1 }) {
    console.log('Linking persons to projects...');
    
    // Destructure persons object for easier access
    const {
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
    } = persons;
    
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
}

module.exports = seedProjectPersons;
