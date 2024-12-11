const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { addToFavorites, getFavorites, addFavorite, removeFavorite, getFavoriteCategories } = require('../controllers/favoriteController');

// Route untuk mendapatkan daftar favorit
router.get('/', getFavorites);

// Route untuk menambahkan favorit
router.post('/:id', addFavorite);

// Route untuk menghapus favorit
router.delete('/:id', removeFavorite);

// Route untuk mendapatkan kategori dari favorit
router.get('/categories', getFavoriteCategories);

module.exports = router;
