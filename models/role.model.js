import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  resource: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage'],
    required: true
  }
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    // 1: Highest (Senior Pastor), 10: Lowest (Basic Member)
    default: 5
  },
  permissions: [permissionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  departmentScope: {
    type: String,
    enum: ['all', 'specific', 'none'],
    default: 'none'
  },
  allowedDepartments: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Predefined roles
const PREDEFINED_ROLES = {
  SENIOR_PASTOR: {
    name: 'Senior Pastor',
    description: 'Highest church leadership with complete system access and authority',
    level: 1,
    isSystem: true,
    departmentScope: 'all',
    permissions: [
      {
        name: 'full_system_access',
        description: 'Complete access to all system features',
        resource: '*',
        action: 'manage'
      }
    ]
  },
  PASTOR: {
    name: 'Pastor',
    description: 'Church pastor with full system access',
    level: 2,
    isSystem: true,
    departmentScope: 'all',
    permissions: [
      {
        name: 'manage_members',
        description: 'Manage church members',
        resource: 'members',
        action: 'manage'
      },
      {
        name: 'manage_roles',
        description: 'Manage user roles',
        resource: 'roles',
        action: 'manage'
      }
    ]
  },
  ELDER: {
    name: 'Elder',
    description: 'Church elder with high-level administrative access',
    level: 3,
    isSystem: true,
    departmentScope: 'all',
    permissions: [
      {
        name: 'view_members',
        description: 'View church members',
        resource: 'members',
        action: 'read'
      },
      {
        name: 'manage_departments',
        description: 'Manage departments',
        resource: 'departments',
        action: 'manage'
      }
    ]
  },
  CHURCH_FINANCE_OFFICER: {
    name: 'Church Finance Officer',
    description: 'Responsible for managing church finances and financial records',
    level: 3,
    isSystem: true,
    departmentScope: 'specific',
    allowedDepartments: ['Finance'],
    permissions: [
      {
        name: 'finance_management',
        description: 'Access to financial management features',
        resource: 'finance',
        action: 'manage'
      },
      {
        name: 'financial_reports',
        description: 'Access to financial reports',
        resource: 'reports',
        action: 'read'
      }
    ]
  },
  DEACON: {
    name: 'Deacon',
    description: 'Church deacon with administrative access',
    level: 4,
    isSystem: true,
    departmentScope: 'all',
    permissions: [
      {
        name: 'view_members',
        description: 'View church members',
        resource: 'members',
        action: 'read'
      },
      {
        name: 'manage_events',
        description: 'Manage church events',
        resource: 'events',
        action: 'manage'
      }
    ]
  },
  DEPARTMENT_LEADER: {
    name: 'Department Leader',
    description: 'Leader of a specific department',
    level: 5,
    isSystem: true,
    departmentScope: 'specific',
    permissions: [
      {
        name: 'manage_department',
        description: 'Manage department members and activities',
        resource: 'department',
        action: 'manage'
      }
    ]
  },
  LANE_LEADER: {
    name: 'Lane Leader',
    description: 'Leader of a specific lane or care cell',
    level: 6,
    isSystem: true,
    departmentScope: 'specific',
    permissions: [
      {
        name: 'manage_lane',
        description: 'Manage lane members and activities',
        resource: 'lane',
        action: 'manage'
      }
    ]
  }
};

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ level: 1 });
roleSchema.index({ isActive: 1 });

const Role = mongoose.model('Role', roleSchema);

// Initialize predefined roles
const initializeRoles = async () => {
  try {
    // Drop existing roles collection to avoid conflicts
    await Role.collection.drop().catch(() => {
      console.log('Roles collection does not exist, creating new one');
    });

    // Create new roles
    for (const [key, roleData] of Object.entries(PREDEFINED_ROLES)) {
      await Role.create(roleData);
    }
    console.log('Predefined roles initialized successfully');
  } catch (error) {
    console.error('Error initializing predefined roles:', error);
  }
};

export { Role, initializeRoles, PREDEFINED_ROLES }; 