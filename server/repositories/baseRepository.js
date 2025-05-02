/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 */
class BaseRepository {
    /**
     * Constructor
     * @param {Object} model - Sequelize model
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Find all records with optional filtering, pagination, and eager loading
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @param {Array} options.include - Eager loading associations
     * @param {Number} options.limit - Maximum number of records to return
     * @param {Number} options.offset - Number of records to skip
     * @param {Array|Object} options.order - Order conditions
     * @param {Object} options.attributes - Attributes to include/exclude
     * @returns {Promise<Array>} Array of records
     */
    async findAll(options = {}) {
        try {
            return await this.model.findAll(options);
        } catch (error) {
            console.error(`Error in ${this.model.name} findAll:`, error);
            throw error;
        }
    }

    /**
     * Find a record by its primary key with optional eager loading
     * @param {String|Number} id - Primary key value
     * @param {Object} options - Query options
     * @param {Array} options.include - Eager loading associations
     * @param {Object} options.attributes - Attributes to include/exclude
     * @returns {Promise<Object>} Found record or null
     */
    async findById(id, options = {}) {
        try {
            return await this.model.findByPk(id, options);
        } catch (error) {
            console.error(`Error in ${this.model.name} findById:`, error);
            throw error;
        }
    }

    /**
     * Find a single record with optional filtering and eager loading
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @param {Array} options.include - Eager loading associations
     * @param {Object} options.attributes - Attributes to include/exclude
     * @returns {Promise<Object>} Found record or null
     */
    async findOne(options = {}) {
        try {
            return await this.model.findOne(options);
        } catch (error) {
            console.error(`Error in ${this.model.name} findOne:`, error);
            throw error;
        }
    }

    /**
     * Create a new record
     * @param {Object} data - Data for the new record
     * @param {Object} options - Create options
     * @param {Transaction} options.transaction - Sequelize transaction
     * @returns {Promise<Object>} Created record
     */
    async create(data, options = {}) {
        try {
            return await this.model.create(data, options);
        } catch (error) {
            console.error(`Error in ${this.model.name} create:`, error);
            throw error;
        }
    }

    /**
     * Update a record by its primary key
     * @param {String|Number} id - Primary key value
     * @param {Object} data - Data to update
     * @param {Object} options - Update options
     * @param {Transaction} options.transaction - Sequelize transaction
     * @returns {Promise<Object>} Updated record
     */
    async update(id, data, options = {}) {
        try {
            const record = await this.findById(id, options);
            if (!record) {
                throw new Error(`${this.model.name} with id ${id} not found`);
            }
            
            return await record.update(data, options);
        } catch (error) {
            console.error(`Error in ${this.model.name} update:`, error);
            throw error;
        }
    }

    /**
     * Delete a record by its primary key
     * @param {String|Number} id - Primary key value
     * @param {Object} options - Delete options
     * @param {Transaction} options.transaction - Sequelize transaction
     * @returns {Promise<Boolean>} True if successful, false otherwise
     */
    async delete(id, options = {}) {
        try {
            const record = await this.findById(id, options);
            if (!record) {
                throw new Error(`${this.model.name} with id ${id} not found`);
            }
            
            await record.destroy(options);
            return true;
        } catch (error) {
            console.error(`Error in ${this.model.name} delete:`, error);
            throw error;
        }
    }

    /**
     * Count records with optional filtering
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @returns {Promise<Number>} Count of records
     */
    async count(options = {}) {
        try {
            return await this.model.count(options);
        } catch (error) {
            console.error(`Error in ${this.model.name} count:`, error);
            throw error;
        }
    }

    /**
     * Find and count records with optional filtering, pagination, and eager loading
     * @param {Object} options - Query options
     * @param {Object} options.where - Where conditions
     * @param {Array} options.include - Eager loading associations
     * @param {Number} options.limit - Maximum number of records to return
     * @param {Number} options.offset - Number of records to skip
     * @param {Array|Object} options.order - Order conditions
     * @param {Object} options.attributes - Attributes to include/exclude
     * @returns {Promise<Object>} Object with count and rows properties
     */
    async findAndCountAll(options = {}) {
        try {
            return await this.model.findAndCountAll(options);
        } catch (error) {
            console.error(`Error in ${this.model.name} findAndCountAll:`, error);
            throw error;
        }
    }

    /**
     * Bulk create records
     * @param {Array} data - Array of data objects
     * @param {Object} options - Bulk create options
     * @param {Transaction} options.transaction - Sequelize transaction
     * @returns {Promise<Array>} Array of created records
     */
    async bulkCreate(data, options = {}) {
        try {
            return await this.model.bulkCreate(data, options);
        } catch (error) {
            console.error(`Error in ${this.model.name} bulkCreate:`, error);
            throw error;
        }
    }

    /**
     * Bulk update records
     * @param {Object} data - Data to update
     * @param {Object} options - Bulk update options
     * @param {Object} options.where - Where conditions
     * @param {Transaction} options.transaction - Sequelize transaction
     * @returns {Promise<Array>} Array of updated records
     */
    async bulkUpdate(data, options = {}) {
        try {
            const [affectedCount] = await this.model.update(data, options);
            return affectedCount;
        } catch (error) {
            console.error(`Error in ${this.model.name} bulkUpdate:`, error);
            throw error;
        }
    }

    /**
     * Bulk delete records
     * @param {Object} options - Bulk delete options
     * @param {Object} options.where - Where conditions
     * @param {Transaction} options.transaction - Sequelize transaction
     * @returns {Promise<Number>} Number of deleted records
     */
    async bulkDelete(options = {}) {
        try {
            return await this.model.destroy(options);
        } catch (error) {
            console.error(`Error in ${this.model.name} bulkDelete:`, error);
            throw error;
        }
    }
}

module.exports = BaseRepository;
