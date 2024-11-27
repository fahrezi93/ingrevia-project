const express = require('express');
const router = express.Router();
const {
    getFavorites,
    addFavorite,
    removeFavorite,
    getFavoriteCategories,
} = require('../controllers/favoriteController');

// Mendapatkan daftar resep favorit user
router.get('/', getFavorites);

// Menambahkan resep ke daftar favorit
router.post('/:id', addFavorite);

// Menghapus resep dari daftar favorit
router.delete('/:id', removeFavorite);

// Mendapatkan kategori dari resep favorit
router.get('/categories', getFavoriteCategories);

module.exports = router;
