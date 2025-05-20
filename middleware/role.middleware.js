import User from '../models/user.model.js';

export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get user from request (set by auth middleware)
      const user = await User.findById(req.user.id).populate('roles');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Check if user has any of the allowed roles
      const hasAllowedRole = user.roles.some(role => 
        allowedRoles.includes(role.name)
      );

      if (!hasAllowedRole) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to perform this action'
        });
      }

      // Add user to request for use in controllers
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error checking user role'
      });
    }
  };
}; 