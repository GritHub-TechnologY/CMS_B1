import mongoose from 'mongoose';

const recurringPatternSchema = new mongoose.Schema({
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'none'],
    default: 'none'
  },
  interval: {
    type: Number,
    default: 1 // Every X days/weeks/months
  },
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  }],
  endDate: {
    type: Date
  },
  endAfterOccurrences: {
    type: Number
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['service', 'prayer', 'youth', 'wedding', 'baptism', 'other'],
    trim: true
  },
  hostDepartment: {
    type: String,
    required: [true, 'Host department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required']
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'group-specific'],
    default: 'public'
  },
  allowedGroups: [{
    type: String,
    trim: true
  }],
  recurringPattern: {
    type: recurringPatternSchema,
    default: () => ({})
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  parentEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  expectedAttendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxCapacity: {
    type: Number
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualMeetingLink: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
eventSchema.index({ startDateTime: 1 });
eventSchema.index({ endDateTime: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ hostDepartment: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ status: 1 });

// Method to check if event is currently active
eventSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startDateTime && now <= this.endDateTime;
};

// Method to check if event is upcoming
eventSchema.methods.isUpcoming = function() {
  return new Date() < this.startDateTime;
};

// Method to check if event is past
eventSchema.methods.isPast = function() {
  return new Date() > this.endDateTime;
};

// Method to generate recurring events
eventSchema.methods.generateRecurringEvents = async function() {
  if (!this.isRecurring || !this.recurringPattern.frequency) {
    return [];
  }

  const events = [];
  let currentDate = new Date(this.startDateTime);
  const endDate = this.recurringPattern.endDate || 
    (this.recurringPattern.endAfterOccurrences ? 
      new Date(currentDate.getTime() + (this.recurringPattern.endAfterOccurrences * 24 * 60 * 60 * 1000)) : 
      new Date(currentDate.getTime() + (365 * 24 * 60 * 60 * 1000))); // Default to 1 year

  while (currentDate <= endDate) {
    if (this.recurringPattern.frequency === 'daily') {
      currentDate.setDate(currentDate.getDate() + this.recurringPattern.interval);
    } else if (this.recurringPattern.frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + (7 * this.recurringPattern.interval));
    } else if (this.recurringPattern.frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + this.recurringPattern.interval);
    }

    if (currentDate <= endDate) {
      const newEvent = new Event({
        ...this.toObject(),
        _id: undefined,
        startDateTime: new Date(currentDate),
        endDateTime: new Date(currentDate.getTime() + (this.endDateTime - this.startDateTime)),
        parentEvent: this._id,
        isRecurring: false
      });
      events.push(newEvent);
    }
  }

  return events;
};

const Event = mongoose.model('Event', eventSchema);

export default Event; 