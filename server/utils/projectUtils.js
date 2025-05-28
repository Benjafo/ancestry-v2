const { ProjectPerson, Document, DocumentPerson, Event, Person, Relationship } = require('../models');
const { Op } = require('sequelize');

/**
 * Utility functions for project-related operations, especially for determining project associations.
 */
class ProjectUtils {
    /**
     * Retrieves all unique project IDs associated with a given entity.
     * This is crucial for ensuring user events are correctly linked to projects
     * for activity feeds and notifications.
     *
     * @param {string} entityType - The type of the entity ('person', 'document', 'event', 'relationship').
     * @param {string} entityId - The UUID of the entity.
     * @returns {Promise<string[]>} An array of unique project IDs.
     */
    static async getProjectIdsForEntity(entityType, entityId) {
        let projectIds = new Set();

        switch (entityType) {
            case 'person':
                const personProjects = await ProjectPerson.findAll({
                    where: { person_id: entityId },
                    attributes: ['project_id']
                });
                personProjects.forEach(pp => projectIds.add(pp.project_id));
                break;

            case 'document':
                // 1. Check if the document is directly associated with a project
                const document = await Document.findByPk(entityId, {
                    attributes: ['project_id']
                });
                if (document && document.project_id) {
                    projectIds.add(document.project_id);
                }

                // 2. Check projects associated with persons linked to this document
                const documentPersons = await DocumentPerson.findAll({
                    where: { document_id: entityId },
                    attributes: ['person_id']
                });
                for (const dp of documentPersons) {
                    const projects = await ProjectUtils.getProjectIdsForEntity('person', dp.person_id);
                    projects.forEach(pId => projectIds.add(pId));
                }
                break;

            case 'event':
                const event = await Event.findByPk(entityId, {
                    attributes: ['person_id']
                });
                if (event && event.person_id) {
                    const projects = await ProjectUtils.getProjectIdsForEntity('person', event.person_id);
                    projects.forEach(pId => projectIds.add(pId));
                }
                break;

            case 'relationship':
                // Assuming relationship entityId refers to the relationship_id
                const relationship = await Relationship.findByPk(entityId, {
                    attributes: ['person1_id', 'person2_id']
                });
                if (relationship) {
                    const projects1 = await ProjectUtils.getProjectIdsForEntity('person', relationship.person1_id);
                    projects1.forEach(pId => projectIds.add(pId));
                    const projects2 = await ProjectUtils.getProjectIdsForEntity('person', relationship.person2_id);
                    projects2.forEach(pId => projectIds.add(pId));
                }
                break;

            default:
                console.warn(`Unknown entity type for project association lookup: ${entityType}`);
                break;
        }

        return Array.from(projectIds);
    }
}

module.exports = ProjectUtils;
