const bcrypt = require('bcrypt');
const { User, Role } = require('../models');
const { sequelize } = require('../models'); // For transactions

const userService = {
    /**
     * Creates a new user and assigns them a specified role.
     * This is used for auto-creating users during service purchase.
     * @param {object} userData - User details (email, first_name, last_name).
     * @param {string} roleName - The name of the role to assign (e.g., 'client').
     * @param {object} [transaction] - Optional Sequelize transaction.
     * @returns {Promise<User>} - The newly created user object.
     */
    createNewUserAndAssignRole: async (userData, roleName, transaction) => {
        const t = transaction || await sequelize.transaction();
        try {
            const { email, first_name, last_name } = userData;

            // Generate a temporary password
            const temporaryPassword = Math.random().toString(36).slice(-12); // 12 random chars
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            const newUser = await User.create({
                email,
                password: hashedPassword,
                first_name,
                last_name,
                is_active: true,
            }, { transaction: t });

            const role = await Role.findOne({ where: { name: roleName }, transaction: t });
            if (!role) {
                throw new Error(`Role '${roleName}' not found.`);
            }

            await newUser.addRole(role, { transaction: t });

            // TODO: Send email to new user with temporary password and login instructions
            console.log(`New user created: ${email} with temporary password: ${temporaryPassword}`); // For development/debugging

            if (!transaction) {
                await t.commit();
            }
            return newUser;
        } catch (error) {
            if (!transaction) {
                await t.rollback();
            }
            console.error('Error creating new user and assigning role:', error);
            throw error;
        }
    },

    // Other user service functions can be added here as needed
    // e.g., getUserById, updateUser, deactivateUser, etc.
};

module.exports = userService;
