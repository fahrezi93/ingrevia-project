const express = require('express');
const router = express.Router();
const { getRecommendations, search, getCategories, discover } = require('../controllers/homeController');

// Home endpoints
router.get('/recommendations', getRecommendations); // Rekomendasi resep berdasarkan popularitas
router.get('/search', search); // Pencarian resep berdasarkan kata kunci
router.get('/categories', getCategories); // Mendapatkan kategori resep
router.get('/discover', discover); // Menemukan 5 resep terbaru

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
});

module.exports = router;