import express from 'express';
import { createMember, getAllMembers, getMemberById, updateMember, archiveMember } from '../controllers/member.controller.js';
import { validateMember } from '../validators/member.validator.js';

const router = express.Router();

// Create a new member
router.post('/', validateMember, createMember);

// Get all members
router.get('/', getAllMembers);

// Get a single member
router.get('/:id', getMemberById);

// Update a member
router.put('/:id', validateMember, updateMember);

// Archive a member
router.delete('/:id', archiveMember);

export default router; 