// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, register, logout, forgotPassword } = require('../controllers/authController');

// Login user
router.post('/login', login);

// Register user
router.post('/register', register);

// Logout user
router.post('/logout', logout);

// Forgot password
router.post('/forgot-password', forgotPassword);

module.exports = router;
