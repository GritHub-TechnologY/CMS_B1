import mongoose from 'mongoose';

const progressNoteSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    required: [true, 'Note content is required']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isConfidential: {
    type: Boolean,
    default: false
  }
});

const discipleshipSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Member ID is required']
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Mentor ID is required']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  goals: [{
    type: String,
    trim: true
  }],
  progressNotes: [progressNoteSchema],
  completedModules: [{
    type: String,
    trim: true
  }],
  spiritualGiftsIdentified: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'paused'],
    default: 'in_progress'
  },
  lastCheckIn: {
    type: Date
  },
  nextCheckIn: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
discipleshipSchema.index({ memberId: 1 });
discipleshipSchema.index({ mentorId: 1 });
discipleshipSchema.index({ status: 1 });
discipleshipSchema.index({ 'progressNotes.date': 1 });

// Method to add a progress note
discipleshipSchema.methods.addProgressNote = async function(note, authorId, isConfidential = false) {
  this.progressNotes.push({
    note,
    authorId,
    isConfidential
  });
  return this.save();
};

// Method to update status
discipleshipSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Method to add completed module
discipleshipSchema.methods.addCompletedModule = async function(module) {
  if (!this.completedModules.includes(module)) {
    this.completedModules.push(module);
  }
  return this.save();
};

// Method to add spiritual gift
discipleshipSchema.methods.addSpiritualGift = async function(gift) {
  if (!this.spiritualGiftsIdentified.includes(gift)) {
    this.spiritualGiftsIdentified.push(gift);
  }
  return this.save();
};

// Method to schedule next check-in
discipleshipSchema.methods.scheduleNextCheckIn = async function(daysFromNow = 7) {
  this.lastCheckIn = new Date();
  this.nextCheckIn = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return this.save();
};

const Discipleship = mongoose.model('Discipleship', discipleshipSchema);

export default Discipleship; 