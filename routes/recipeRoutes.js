const express = require('express');
const router = express.Router();
const { getRecipes, searchRecipes, getRecipeById } = require('../controllers/recipeController');

// Recipe endpoints
router.get('/', getRecipes);
router.get('/search', searchRecipes);
router.get('/:id', getRecipeById);

module.exports = router;
