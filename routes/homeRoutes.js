const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getRecommendations } = require('../controllers/homeController');

// Home endpoints
router.get('/recommendations', getRecommendations);
router.get('/search', search);
router.get('/categories', getCategories);
router.get('/discover', discover);

module.exports = router;
