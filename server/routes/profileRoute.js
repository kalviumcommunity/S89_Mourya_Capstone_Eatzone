import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profileController.js';

const router = express.Router();

// Get user profile
router.get('/', getUserProfile);

// Update user profile
router.put('/update', updateUserProfile);

export default router;
