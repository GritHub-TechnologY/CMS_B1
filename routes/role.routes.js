import express from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  initializeRoles
} from '../controllers/role.controller.js';
import { hasRole, checkRoleHierarchy } from '../middleware/rbac.middleware.js';

const router = express.Router();

// Initialize predefined roles (protected, only for system setup)
router.post('/initialize', hasRole(['Senior Pastor']), initializeRoles);

// Get all roles
router.get('/', hasRole(['Senior Pastor', 'Pastor', 'Elder']), getAllRoles);

// Get role by ID
router.get('/:id', hasRole(['Senior Pastor', 'Pastor', 'Elder']), getRoleById);

// Create new role (only Senior Pastor can create new roles)
router.post('/', hasRole(['Senior Pastor']), createRole);

// Update role (only Senior Pastor can update roles)
router.put('/:id', hasRole(['Senior Pastor']), updateRole);

// Delete role (only Senior Pastor can delete roles)
router.delete('/:id', hasRole(['Senior Pastor']), deleteRole);

export default router; 