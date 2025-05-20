import { Role, PREDEFINED_ROLES } from '../models/role.model.js';

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .sort({ level: 1 });
    
    res.status(200).json({
      status: 'success',
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get role by ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new role
export const createRole = async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    
    res.status(201).json({
      status: 'success',
      data: role
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update role
export const updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot modify system roles'
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: updatedRole
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete role
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(403).json({
        status: 'error',
        message: 'Cannot delete system roles'
      });
    }

    // Soft delete
    role.isActive = false;
    await role.save();

    res.status(200).json({
      status: 'success',
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Initialize predefined roles
export const initializeRoles = async (req, res) => {
  try {
    for (const [key, roleData] of Object.entries(PREDEFINED_ROLES)) {
      await Role.findOneAndUpdate(
        { name: roleData.name },
        roleData,
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Predefined roles initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 