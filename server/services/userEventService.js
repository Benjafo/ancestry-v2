const { UserEvent } = require('../models');

/**
 * Service for creating and managing user events
 */
class UserEventService {
    /**
     * Create a new user event
     * @param {string} userId - The ID of the user receiving the notification
     * @param {string} actorId - The ID of the user performing the action
     * @param {string} eventType - The type of event
     * @param {string} message - Human-readable description of the event
     * @param {string} [entityId] - Optional ID of the related entity
     * @param {string} [entityType] - Optional type of the related entity
     * @returns {Promise<UserEvent>} The created user event
     */
    static async createEvent(userId, actorId, eventType, message, entityId = null, entityType = null) {
        return await UserEvent.create({
            user_id: userId,
            actor_id: actorId,
            event_type: eventType,
            message,
            entity_id: entityId,
            entity_type: entityType
        });
    }

    /**
     * Create multiple user events (e.g., for group notifications)
     * @param {Array<string>} userIds - Array of user IDs to receive the notification
     * @param {string} actorId - The ID of the user performing the action
     * @param {string} eventType - The type of event
     * @param {string} message - Human-readable description of the event
     * @param {string} [entityId] - Optional ID of the related entity
     * @param {string} [entityType] - Optional type of the related entity
     * @returns {Promise<Array<UserEvent>>} The created user events
     */
    static async createEventForMultipleUsers(userIds, actorId, eventType, message, entityId = null, entityType = null) {
        const events = userIds.map(userId => ({
            user_id: userId,
            actor_id: actorId,
            event_type: eventType,
            message,
            entity_id: entityId,
            entity_type: entityType
        }));
        
        return await UserEvent.bulkCreate(events);
    }

    /**
     * Create an event for all users associated with a project
     * @param {string} projectId - The ID of the project
     * @param {string} actorId - The ID of the user performing the action
     * @param {string} eventType - The type of event
     * @param {string} message - Human-readable description of the event
     * @param {string} [entityId] - Optional ID of the related entity
     * @param {string} [entityType] - Optional type of the related entity
     * @returns {Promise<Array<UserEvent>>} The created user events
     */
    static async createEventForProjectUsers(projectIds, actorId, eventType, message, entityId = null, entityType = null) {
        const { ProjectUser } = require('../models');
        const projectUsers = await ProjectUser.findAll({
            where: { project_id: projectIds } // Find users for all relevant projects
        });

        let userIdsToNotify = projectUsers.map(pu => pu.user_id);
        const eventsToCreate = [];

        // Add the actor to the notification list if not already there
        if (!userIdsToNotify.includes(actorId)) {
            userIdsToNotify.push(actorId);
        }

        // Create events for all unique users associated with the projects
        for (const userId of new Set(userIdsToNotify)) { // Use Set to ensure unique user IDs
            eventsToCreate.push({
                user_id: userId,
                actor_id: actorId,
                event_type: eventType,
                message,
                entity_id: entityId, // Now refers to the actual entity (person, document, etc.)
                entity_type: entityType, // Now refers to the actual entity type
                project_ids: projectIds // Store the array of relevant project IDs
            });
        }

        if (eventsToCreate.length === 0) {
            return [];
        }

        return await UserEvent.bulkCreate(eventsToCreate);
    }
}

module.exports = UserEventService;
