const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getTheme, updateProfilePic, about } = require('../controllers/userController');

// Get profile
router.get('/profile', getProfile);

// Update profile
router.put('/profile', updateProfile);

// Get theme
router.get('/theme', getTheme);

// Update profile picture
router.post('/profile-pic', updateProfilePic);

// About developer
router.get('/about', about);

module.exports = router;
