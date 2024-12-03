const express = require('express');
const router = express.Router();
const { getAllRecipes, getRecipeById } = require('../controllers/recipeController');  // Memastikan kamu mengimpor fungsi yang benar

// Recipe endpoints
router.get('/', getAllRecipes);  // Menggunakan getAllRecipes
router.get('/:id', getRecipeById);  // Menggunakan getRecipeById

module.exports = router;
