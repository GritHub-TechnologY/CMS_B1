import express from 'express';
import {
  signup,
  signin,
  getCurrentUser,
  changePassword
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.post('/change-password', verifyToken, changePassword);

export default router; 