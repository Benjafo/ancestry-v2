const User = require('./user');
const Role = require('./role');
const Tree = require('./tree');

// Define User-Role associations
User.belongsToMany(Role, { 
    through: 'user_roles',
    foreignKey: 'user_id',
    otherKey: 'role_id'
});

Role.belongsToMany(User, { 
    through: 'user_roles',
    foreignKey: 'role_id',
    otherKey: 'user_id'
});

// Define User-Tree associations
User.belongsToMany(Tree, {
    through: 'user_trees',
    foreignKey: 'user_id',
    otherKey: 'tree_id'
});

Tree.belongsToMany(User, {
    through: 'user_trees',
    foreignKey: 'tree_id',
    otherKey: 'user_id'
});

// Define Tree creator association
Tree.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

module.exports = {
    User,
    Role,
    Tree
};
