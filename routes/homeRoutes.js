const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getRecommendations, search, getCategories, discover } = require('../controllers/homeController');

// Home endpoints
router.post('/recommendations', authenticate, getRecommendations);
router.get('/search', authenticate, search);
router.get('/categories', authenticate, getCategories); 
router.get('/discover', authenticate, discover);

// Error handling (optional)
router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
});

module.exports = router;
