const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getRecommendations, search, getCategories, discover } = require('../controllers/homeController');

// Home endpoints
router.post('/recommendations', authenticate, getRecommendations); // Rekomendasi berdasarkan BMI dan TDEE
router.post('/search', authenticate, search); // Pencarian resep berdasarkan kata kunci
router.get('/categories', authenticate, getCategories); // Mendapatkan kategori resep
router.get('/discover', authenticate, discover); // Menemukan 5 resep terbaru

// Error handling (optional)
router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
});

module.exports = router;
