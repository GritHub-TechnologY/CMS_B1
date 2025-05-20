import Member from '../models/member.model.js';

// Create a new member
export const createMember = async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json({
      status: 'success',
      data: member
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all members with pagination
export const getAllMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const members = await Member.find({ isArchived: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments({ isArchived: false });

    res.status(200).json({
      status: 'success',
      data: members,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single member by ID
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a member
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: member
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Soft delete a member (archive)
export const archiveMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Member archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 