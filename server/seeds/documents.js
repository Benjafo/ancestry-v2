const { Document, DocumentPerson } = require('../models');

/**
 * Seeds the documents table and document-person associations
 * @param {Object} transaction - Sequelize transaction
 * @param {Object} params - Parameters containing persons, events, and project
 * @param {Object} params.persons - Object containing all person entities
 * @param {Object} params.events - Object containing all event entities
 * @param {Object} params.project1 - The main project (not directly used but included for consistency)
 * @returns {Promise<Object>} Created documents
 */
async function seedDocuments(transaction, { persons, events, project1 }) {
    console.log('Creating documents...');
    
    // Destructure persons object for easier access
    const {
        johnSmithSr,
        marySmith,
        johnSmithJr
    } = persons;
    
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
    
    console.log('Documents created successfully');
    
    return {
        immigrationDoc,
        johnSrBirthCert,
        johnJrBirthCert,
        johnMaryMarriageCert,
        census1930Doc,
        militaryRecordDoc,
        familyPhotoDoc
    };
}

module.exports = seedDocuments;
