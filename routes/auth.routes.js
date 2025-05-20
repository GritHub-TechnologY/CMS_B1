import express from 'express';
import {
  signup,
  signin,
  getCurrentUser,
  changePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/change-password', protect, changePassword);

export default router; 