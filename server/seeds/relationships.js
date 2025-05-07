const { Relationship } = require('../models');

/**
 * Seeds the relationships table
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} persons - Object containing all person entities
 * @returns {Promise<void>}
 */
async function seedRelationships(transaction, persons) {
    console.log('Creating family relationships...');
    
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
    
    console.log('Relationships created successfully');
}

module.exports = seedRelationships;
