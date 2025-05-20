import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  primaryRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  departments: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'roles': 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to check if user has a specific role
userSchema.methods.hasRole = function(roleName) {
  return this.roles.some(role => role.name === roleName);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(resource, action) {
  return this.roles.some(role => 
    role.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    )
  );
};

// Method to get all permissions
userSchema.methods.getAllPermissions = function() {
  const permissions = new Set();
  this.roles.forEach(role => {
    role.permissions.forEach(permission => {
      permissions.add(`${permission.resource}:${permission.action}`);
    });
  });
  return Array.from(permissions);
};

const User = mongoose.model('User', userSchema);

export default User; 