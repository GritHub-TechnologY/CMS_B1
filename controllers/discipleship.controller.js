import Discipleship from '../models/discipleship.model.js';
import User from '../models/user.model.js';

// Start a new discipleship journey
export const startJourney = async (req, res) => {
  try {
    const { memberId, mentorId, goals } = req.body;

    // Check if member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    // Check if mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        status: 'error',
        message: 'Mentor not found'
      });
    }

    // Check if journey already exists
    const existingJourney = await Discipleship.findOne({ memberId });
    if (existingJourney) {
      return res.status(400).json({
        status: 'error',
        message: 'Discipleship journey already exists for this member'
      });
    }

    // Create new journey
    const journey = new Discipleship({
      memberId,
      mentorId,
      goals,
      status: 'in_progress'
    });

    await journey.save();
    await journey.scheduleNextCheckIn();

    res.status(201).json({
      status: 'success',
      data: journey
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update journey
export const updateJourney = async (req, res) => {
  try {
    const { id } = req.params;
    const { goals, status, completedModules, spiritualGiftsIdentified } = req.body;

    const journey = await Discipleship.findById(id);
    if (!journey) {
      return res.status(404).json({
        status: 'error',
        message: 'Journey not found'
      });
    }

    // Update fields if provided
    if (goals) journey.goals = goals;
    if (status) journey.status = status;
    if (completedModules) journey.completedModules = completedModules;
    if (spiritualGiftsIdentified) journey.spiritualGiftsIdentified = spiritualGiftsIdentified;

    await journey.save();

    res.status(200).json({
      status: 'success',
      data: journey
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add pastoral note
export const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, isConfidential } = req.body;
    const authorId = req.user.id; // From auth middleware

    const journey = await Discipleship.findById(id);
    if (!journey) {
      return res.status(404).json({
        status: 'error',
        message: 'Journey not found'
      });
    }

    await journey.addProgressNote(note, authorId, isConfidential);

    res.status(200).json({
      status: 'success',
      data: journey
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get member's journey
export const getMemberJourney = async (req, res) => {
  try {
    const { memberId } = req.params;
    const requestingUser = req.user; // From auth middleware

    // Check if user has permission to view
    if (requestingUser.id !== memberId && !requestingUser.hasRole('Pastor')) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view this journey'
      });
    }

    const journey = await Discipleship.findOne({ memberId })
      .populate('memberId', 'fullName email')
      .populate('mentorId', 'fullName email');

    if (!journey) {
      return res.status(404).json({
        status: 'error',
        message: 'Journey not found'
      });
    }

    // Filter out confidential notes if user is not a pastor
    if (!requestingUser.hasRole('Pastor')) {
      journey.progressNotes = journey.progressNotes.filter(note => !note.isConfidential);
    }

    res.status(200).json({
      status: 'success',
      data: journey
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get mentor's mentees
export const getMentees = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const requestingUser = req.user; // From auth middleware

    // Check if user has permission to view
    if (requestingUser.id !== mentorId && !requestingUser.hasRole('Pastor')) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view these mentees'
      });
    }

    const journeys = await Discipleship.find({ mentorId })
      .populate('memberId', 'fullName email')
      .select('-progressNotes');

    res.status(200).json({
      status: 'success',
      data: journeys
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete journey
export const deleteJourney = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user; // From auth middleware

    // Only admin can delete
    if (!requestingUser.hasRole('Admin')) {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can delete journeys'
      });
    }

    const journey = await Discipleship.findByIdAndDelete(id);
    if (!journey) {
      return res.status(404).json({
        status: 'error',
        message: 'Journey not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Journey deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 