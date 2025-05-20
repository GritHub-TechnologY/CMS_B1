import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Member ID is required']
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'livestream'],
    required: [true, 'Attendance status is required']
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recorder ID is required']
  },
  checkInMethod: {
    type: String,
    enum: ['manual', 'qr_code', 'token'],
    default: 'manual'
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for member and event
attendanceSchema.index({ memberId: 1, eventId: 1 }, { unique: true });

// Indexes for better query performance
attendanceSchema.index({ eventId: 1 });
attendanceSchema.index({ memberId: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ checkInTime: 1 });

// Method to check out a member
attendanceSchema.methods.checkOut = async function() {
  this.checkOutTime = new Date();
  return this.save();
};

// Method to update status
attendanceSchema.methods.updateStatus = async function(newStatus, remarks = '') {
  this.status = newStatus;
  if (remarks) this.remarks = remarks;
  return this.save();
};

// Static method to get attendance statistics for an event
attendanceSchema.statics.getEventStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, { present: 0, absent: 0, livestream: 0 });
};

// Static method to get member's attendance history
attendanceSchema.statics.getMemberHistory = async function(memberId, startDate, endDate) {
  const query = { memberId };
  if (startDate || endDate) {
    query.checkInTime = {};
    if (startDate) query.checkInTime.$gte = new Date(startDate);
    if (endDate) query.checkInTime.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate('eventId', 'title type startDateTime endDateTime')
    .sort({ checkInTime: -1 });
};

// Static method to get department attendance report
attendanceSchema.statics.getDepartmentReport = async function(department, startDate, endDate) {
  const query = {
    'eventId.hostDepartment': department
  };
  if (startDate || endDate) {
    query.checkInTime = {};
    if (startDate) query.checkInTime.$gte = new Date(startDate);
    if (endDate) query.checkInTime.$lte = new Date(endDate);
  }

  return this.aggregate([
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    { $match: query },
    {
      $group: {
        _id: {
          eventId: '$eventId',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance; 