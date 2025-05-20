import express from 'express';
import {
  startJourney,
  updateJourney,
  addNote,
  getMemberJourney,
  getMentees,
  deleteJourney
} from '../controllers/discipleship.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Start new journey (Pastor/Admin only)
router.post('/start',
  checkRole(['Pastor', 'Admin']),
  startJourney
);

// Update journey (Pastor/Admin only)
router.patch('/:id',
  checkRole(['Pastor', 'Admin']),
  updateJourney
);

// Add pastoral note (Pastor/Admin only)
router.patch('/:id/add-note',
  checkRole(['Pastor', 'Admin']),
  addNote
);

// Get member's journey (Member can view own, Pastors can view any)
router.get('/member/:memberId',
  getMemberJourney
);

// Get mentor's mentees (Mentor can view own, Pastors can view any)
router.get('/mentor/:mentorId',
  getMentees
);

// Delete journey (Admin only)
router.delete('/:id',
  checkRole(['Admin']),
  deleteJourney
);

export default router; 