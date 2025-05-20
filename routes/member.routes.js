import express from 'express';
import {
  registerMember,
  updateMember,
  getAllMembers,
  getMember,
  archiveMember
} from '../controllers/member.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all members (filtered by user's access level)
router.get('/', getAllMembers);

// Get single member
router.get('/:id', getMember);

// Register new member (requires authorized roles)
router.post('/',
  checkRole(['Senior Pastor', 'Pastor', 'Elder', 'Deacon', 'Lane Leader', 'IT Officer']),
  registerMember
);

// Update member (requires authorized roles)
router.patch('/:id',
  checkRole(['Senior Pastor', 'Pastor', 'Elder', 'Deacon', 'Lane Leader', 'IT Officer']),
  updateMember
);

// Archive member (requires Senior Pastor, Pastor, or Elder role)
router.patch('/:id/archive',
  checkRole(['Senior Pastor', 'Pastor', 'Elder']),
  archiveMember
);

export default router; 