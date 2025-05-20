import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  homeAddress: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  region: {
    type: String,
    required: true,
    trim: true
  },
  occupation: {
    type: String,
    trim: true
  },
  employer: {
    type: String,
    trim: true
  },
  educationLevel: {
    type: String,
    trim: true
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    required: true
  },
  spouseName: {
    type: String,
    trim: true
  },
  childrenNames: [{
    type: String,
    trim: true
  }],
  dateJoined: {
    type: Date,
    default: Date.now
  },
  baptismDate: {
    type: Date
  },
  spiritualGifts: [{
    type: String,
    trim: true
  }],
  departmentsInvolved: [{
    type: String,
    trim: true
  }],
  membershipStatus: {
    type: String,
    enum: ['Visitor', 'New Member', 'Active', 'Inactive'],
    default: 'Visitor'
  },
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    }
  },
  medicalNotes: {
    type: String,
    trim: true
  },
  profilePictureURL: {
    type: String,
    trim: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
memberSchema.index({ email: 1 });
memberSchema.index({ fullName: 1 });
memberSchema.index({ membershipStatus: 1 });

const Member = mongoose.model('Member', memberSchema);

export default Member; 