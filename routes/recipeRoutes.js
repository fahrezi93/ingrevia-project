const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getRecommendations } = require('../controllers/homeController');

// Recipe endpoints
router.get('/', getRecipes);
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);

module.exports = router;
