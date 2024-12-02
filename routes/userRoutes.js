const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getProfile, updateProfile, uploadProfilePic, getTheme, about } = require('../controllers/userController');

// Get profile
router.get('/profile', getProfile);

// Update profile
router.put('/profile', updateProfile);

// Get theme
router.get('/theme', getTheme);

// Update profile picture
router.post('/profile-pic', uploadProfilePic);

// About developer
router.get('/about', about);

module.exports = router;
