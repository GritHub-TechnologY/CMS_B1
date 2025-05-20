import { Role } from '../models/role.model.js';

// Middleware to check if user has required role
export const hasRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const userRoles = await Role.find({ _id: { $in: req.user.roles } });
      const hasRequiredRole = userRoles.some(role => 
        Array.isArray(roleNames) ? roleNames.includes(role.name) : role.name === roleNames
      );

      if (!hasRequiredRole) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user has required permission
export const hasPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const hasRequiredPermission = await req.user.hasPermission(resource, action);
      
      if (!hasRequiredPermission) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check department access
export const hasDepartmentAccess = (department) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const userRoles = await Role.find({ _id: { $in: req.user.roles } });
      const hasAccess = userRoles.some(role => {
        if (role.departmentScope === 'all') return true;
        if (role.departmentScope === 'specific') {
          return role.allowedDepartments.includes(department);
        }
        return false;
      });

      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'No access to this department'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check role hierarchy
export const checkRoleHierarchy = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const userRoles = await Role.find({ _id: { $in: req.user.roles } });
      const highestLevel = Math.min(...userRoles.map(role => role.level));

      if (highestLevel > requiredLevel) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient role level'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 