import Attendance from '../models/attendance.model.js';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';

// Record attendance
export const recordAttendance = async (req, res) => {
  try {
    const {
      memberId,
      eventId,
      status,
      checkInTime,
      remarks,
      checkInMethod
    } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Check if member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      memberId,
      eventId,
      checkInTime: {
        $gte: new Date(event.startDateTime),
        $lte: new Date(event.endDateTime)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        status: 'error',
        message: 'Attendance already recorded for this event'
      });
    }

    // Calculate if late
    const isLate = checkInTime > event.startDateTime;
    const lateMinutes = isLate ? 
      Math.floor((checkInTime - event.startDateTime) / (1000 * 60)) : 0;

    const attendance = new Attendance({
      memberId,
      eventId,
      status,
      checkInTime,
      remarks,
      recordedBy: req.user.id,
      checkInMethod,
      isLate,
      lateMinutes
    });

    await attendance.save();

    res.status(201).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Check out member
export const checkOutMember = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { checkOutTime, remarks } = req.body;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    // Only allow check out if not already checked out
    if (attendance.checkOutTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Member already checked out'
      });
    }

    await attendance.checkOut(checkOutTime, remarks);

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get event attendance
export const getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    const query = { eventId };
    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .populate('memberId', 'fullName email')
      .populate('recordedBy', 'fullName')
      .sort({ checkInTime: 1 });

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get member attendance history
export const getMemberAttendance = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { startDate, endDate, status } = req.query;

    const query = { memberId };
    if (status) query.status = status;

    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('eventId', 'title type startDateTime endDateTime')
      .populate('recordedBy', 'fullName')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get department attendance report
export const getDepartmentReport = async (req, res) => {
  try {
    const { department } = req.params;
    const { startDate, endDate } = req.query;

    const report = await Attendance.getDepartmentReport(department, startDate, endDate);

    res.status(200).json({
      status: 'success',
      data: report
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update attendance status
export const updateAttendanceStatus = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        status: 'error',
        message: 'Attendance record not found'
      });
    }

    await attendance.updateStatus(status, remarks);

    res.status(200).json({
      status: 'success',
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = await Attendance.getAttendanceStats(eventId);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 