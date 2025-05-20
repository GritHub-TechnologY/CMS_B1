import Event from '../models/event.model.js';
import User from '../models/user.model.js';

// Create new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      type,
      hostDepartment,
      location,
      startDateTime,
      endDateTime,
      description,
      visibility,
      allowedGroups,
      isRecurring,
      recurringPattern,
      maxCapacity,
      isVirtual,
      virtualMeetingLink,
      expectedAttendees
    } = req.body;

    // Create the event
    const event = new Event({
      title,
      type,
      hostDepartment,
      location,
      startDateTime,
      endDateTime,
      description,
      createdBy: req.user.id,
      visibility,
      allowedGroups,
      isRecurring,
      recurringPattern,
      maxCapacity,
      isVirtual,
      virtualMeetingLink,
      expectedAttendees
    });

    await event.save();

    // If it's a recurring event, generate the recurring instances
    if (isRecurring && recurringPattern) {
      const recurringEvents = await event.generateRecurringEvents();
      if (recurringEvents.length > 0) {
        await Event.insertMany(recurringEvents);
      }
    }

    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const {
      type,
      department,
      startDate,
      endDate,
      status,
      visibility
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (department) query.hostDepartment = department;
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    // Date range filter
    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) query.startDateTime.$gte = new Date(startDate);
      if (endDate) query.startDateTime.$lte = new Date(endDate);
    }

    // If user is not admin/pastor, only show public events or events they're allowed to see
    if (!req.user.hasRole('Admin') && !req.user.hasRole('Pastor')) {
      query.$or = [
        { visibility: 'public' },
        { 
          visibility: 'group-specific',
          allowedGroups: { $in: req.user.departments }
        }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName')
      .sort({ startDateTime: 1 });

    res.status(200).json({
      status: 'success',
      data: events
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'fullName')
      .populate('expectedAttendees', 'fullName email');

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Check visibility
    if (event.visibility === 'private' && 
        !req.user.hasRole('Admin') && 
        !req.user.hasRole('Pastor') &&
        event.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this event'
      });
    }

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Check if user has permission to update
    if (!req.user.hasRole('Admin') && 
        !req.user.hasRole('Pastor') && 
        event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this event'
      });
    }

    // Update fields
    const allowedUpdates = [
      'title', 'type', 'hostDepartment', 'location',
      'startDateTime', 'endDateTime', 'description',
      'visibility', 'allowedGroups', 'status',
      'maxCapacity', 'isVirtual', 'virtualMeetingLink',
      'expectedAttendees'
    ];

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        event[key] = req.body[key];
      }
    });

    await event.save();

    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    // Only admin or event creator can delete
    if (!req.user.hasRole('Admin') && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this event'
      });
    }

    // If it's a recurring event, delete all instances
    if (event.isRecurring) {
      await Event.deleteMany({ parentEvent: event._id });
    }

    await event.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      startDateTime: { $gt: new Date() },
      status: 'scheduled'
    })
    .populate('createdBy', 'fullName')
    .sort({ startDateTime: 1 })
    .limit(10);

    res.status(200).json({
      status: 'success',
      data: events
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get events by department
export const getDepartmentEvents = async (req, res) => {
  try {
    const { department } = req.params;
    const { startDate, endDate } = req.query;

    const query = { hostDepartment: department };

    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) query.startDateTime.$gte = new Date(startDate);
      if (endDate) query.startDateTime.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate('createdBy', 'fullName')
      .sort({ startDateTime: 1 });

    res.status(200).json({
      status: 'success',
      data: events
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 