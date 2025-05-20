import Member from '../models/member.model.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

// Register new member
export const registerMember = async (req, res) => {
  try {
    const {
      fullName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      city,
      region,
      occupation,
      employer,
      educationLevel,
      maritalStatus,
      spouseName,
      childrenNames,
      baptismDate,
      spiritualGifts,
      departmentsInvolved,
      membershipStatus,
      emergencyContact,
      medicalNotes,
      profilePictureURL,
      // User account details
      password,
      roles,
      departments
    } = req.body;

    // Check if member with email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({
        status: 'error',
        message: 'Member with this email already exists'
      });
    }

    // Create member record
    const member = new Member({
      fullName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      homeAddress,
      city,
      region,
      occupation,
      employer,
      educationLevel,
      maritalStatus,
      spouseName,
      childrenNames,
      baptismDate,
      spiritualGifts,
      departmentsInvolved,
      membershipStatus,
      emergencyContact,
      medicalNotes,
      profilePictureURL
    });

    await member.save();

    // If password is provided, create user account
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
        fullName,
        roles,
        departments,
        isActive: true
      });

      await user.save();
    }

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

// Update member details
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if member exists
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    // Check if user has permission to update
    if (!req.user.hasRole('Senior Pastor') && 
        !req.user.hasRole('Pastor') && 
        !req.user.hasRole('Elder') && 
        !req.user.hasRole('Deacon') && 
        !req.user.hasRole('Lane Leader') && 
        !req.user.hasRole('IT Officer')) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update member details'
      });
    }

    // Update fields
    const allowedUpdates = [
      'fullName', 'gender', 'dateOfBirth', 'phoneNumber',
      'homeAddress', 'city', 'region', 'occupation',
      'employer', 'educationLevel', 'maritalStatus',
      'spouseName', 'childrenNames', 'baptismDate',
      'spiritualGifts', 'departmentsInvolved', 'membershipStatus',
      'emergencyContact', 'medicalNotes', 'profilePictureURL'
    ];

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        member[key] = updateData[key];
      }
    });

    await member.save();

    // If email is being updated, update user account as well
    if (updateData.email && updateData.email !== member.email) {
      const user = await User.findOne({ email: member.email });
      if (user) {
        user.email = updateData.email;
        await user.save();
      }
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

// Get all members
export const getAllMembers = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (status) query.membershipStatus = status;
    if (department) query.departmentsInvolved = department;

    const members = await Member.find(query)
      .sort({ fullName: 1 });

    res.status(200).json({
      status: 'success',
      data: members
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single member
export const getMember = async (req, res) => {
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
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Archive member
export const archiveMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    // Only Senior Pastor, Pastor, or Elder can archive members
    if (!req.user.hasRole('Senior Pastor') && 
        !req.user.hasRole('Pastor') && 
        !req.user.hasRole('Elder')) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to archive members'
      });
    }

    member.isArchived = true;
    await member.save();

    // Also deactivate user account if exists
    const user = await User.findOne({ email: member.email });
    if (user) {
      user.isActive = false;
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Member archived successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 