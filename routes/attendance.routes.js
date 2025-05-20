import express from 'express';
import {
  recordAttendance,
  checkOutMember,
  getEventAttendance,
  getMemberAttendance,
  getDepartmentReport,
  updateAttendanceStatus,
  getAttendanceStats
} from '../controllers/attendance.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Record attendance (requires Admin, Pastor, or Department Head role)
router.post('/',
  checkRole(['Admin', 'Pastor', 'Department Head']),
  recordAttendance
);

// Check out member (requires Admin, Pastor, or Department Head role)
router.patch('/:attendanceId/checkout',
  checkRole(['Admin', 'Pastor', 'Department Head']),
  checkOutMember
);

// Update attendance status (requires Admin, Pastor, or Department Head role)
router.patch('/:attendanceId/status',
  checkRole(['Admin', 'Pastor', 'Department Head']),
  updateAttendanceStatus
);

// Get event attendance
router.get('/event/:eventId', getEventAttendance);

// Get member attendance history
router.get('/member/:memberId', getMemberAttendance);

// Get department attendance report (requires Admin, Pastor, or Department Head role)
router.get('/department/:department/report',
  checkRole(['Admin', 'Pastor', 'Department Head']),
  getDepartmentReport
);

// Get attendance statistics
router.get('/event/:eventId/stats', getAttendanceStats);

export default router; 