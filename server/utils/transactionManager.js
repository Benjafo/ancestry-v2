const { sequelize } = require('../config/database');

/**
 * Transaction Manager
 * Provides utilities for managing database transactions
 */
class TransactionManager {
    /**
     * Execute a function within a transaction
     * If the function throws an error, the transaction will be rolled back
     * If the function completes successfully, the transaction will be committed
     * 
     * @param {Function} callback - Function to execute within the transaction
     * @param {Object} options - Transaction options
     * @returns {Promise<*>} Result of the callback function
     */
    static async executeTransaction(callback, options = {}) {
        const transaction = await sequelize.transaction(options);
        
        try {
            const result = await callback(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get a new transaction
     * The caller is responsible for committing or rolling back the transaction
     * 
     * @param {Object} options - Transaction options
     * @returns {Promise<Transaction>} Sequelize transaction
     */
    static async getTransaction(options = {}) {
        return await sequelize.transaction(options);
    }

    /**
     * Commit a transaction
     * 
     * @param {Transaction} transaction - Sequelize transaction
     * @returns {Promise<void>}
     */
    static async commitTransaction(transaction) {
        if (transaction) {
            await transaction.commit();
        }
    }

    /**
     * Rollback a transaction
     * 
     * @param {Transaction} transaction - Sequelize transaction
     * @returns {Promise<void>}
     */
    static async rollbackTransaction(transaction) {
        if (transaction) {
            await transaction.rollback();
        }
    }

    /**
     * Check if a transaction is active
     * 
     * @param {Transaction} transaction - Sequelize transaction
     * @returns {Boolean} True if the transaction is active, false otherwise
     */
    static isTransactionActive(transaction) {
        return transaction && !transaction.finished;
    }
}

module.exports = TransactionManager;
