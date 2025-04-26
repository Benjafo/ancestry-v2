const jwt = require('jsonwebtoken');
const { User, Tree } = require('../models');

// Verify JWT token
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Check if user has required role
exports.hasRole = (role) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        if (req.user.roles.includes(role)) {
            next();
        } else {
            res.status(403).json({ message: 'Insufficient permissions' });
        }
    };
};

// Check if user has any of the required roles
exports.hasAnyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
        
        if (hasRequiredRole) {
            next();
        } else {
            res.status(403).json({ message: 'Insufficient permissions' });
        }
    };
};

// Check if user has access to a specific tree
exports.hasTreeAccess = (accessLevel = 'view') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            
            const treeId = req.params.treeId;
            
            if (!treeId) {
                return res.status(400).json({ message: 'Tree ID is required' });
            }
            
            // Managers have access to all trees
            if (req.user.roles.includes('manager')) {
                return next();
            }
            
            // Check if user has access to the tree
            const user = await User.findByPk(req.user.user_id, {
                include: [{
                    model: Tree,
                    through: {
                        where: { 
                            tree_id: treeId,
                            ...(accessLevel === 'edit' ? { access_level: 'edit' } : {})
                        }
                    }
                }]
            });
            
            if (!user || user.Trees.length === 0) {
                return res.status(403).json({ message: 'You do not have access to this tree' });
            }
            
            next();
        } catch (error) {
            console.error('Tree access check error:', error);
            res.status(500).json({ message: 'Server error checking tree access' });
        }
    };
};
