import express from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getDepartmentEvents
} from '../controllers/event.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all events (filtered by user's access level)
router.get('/', getEvents);

// Get upcoming events
router.get('/upcoming', getUpcomingEvents);

// Get department events
router.get('/department/:department', getDepartmentEvents);

// Get single event
router.get('/:id', getEvent);

// Create event (requires Admin, Pastor, or Department Head role)
router.post('/',
  checkRole(['Admin', 'Pastor', 'Department Head']),
  createEvent
);

// Update event (requires Admin, Pastor, or event creator)
router.patch('/:id',
  checkRole(['Admin', 'Pastor', 'Department Head']),
  updateEvent
);

// Delete event (requires Admin or event creator)
router.delete('/:id',
  checkRole(['Admin', 'Pastor']),
  deleteEvent
);

export default router; 