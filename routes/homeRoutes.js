const express = require('express');
const router = express.Router();
const { getRecommendations, search, getCategories, discover } = require('../controllers/homeController');

// Home endpoints
router.get('/recommendations', getRecommendations);
router.get('/search', search);
router.get('/categories', getCategories);
router.get('/discover', discover);

module.exports = router;
