const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getRecommendations, search, getCategories, discover } = require('../controllers/homeController'); // Mengimpor semua fungsi

// Home endpoints
router.get('/recommendations', getRecommendations);
router.get('/search', search); // Menambahkan route search
router.get('/categories', getCategories); // Menambahkan route getCategories
router.get('/discover', discover); // Menambahkan route discover

module.exports = router;
