const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

// Mendapatkan daftar resep favorit user
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id; // ID user dari token autentikasi
        const favorites = await Favorite.find({ user: userId }).populate('recipe');
        res.status(200).json({ success: true, data: favorites });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil daftar favorit.' });
    }
};

// Menambahkan resep ke daftar favorit
exports.addFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = req.params.id;

        // Cek apakah resep sudah ada di favorit
        const exists = await Favorite.findOne({ user: userId, recipe: recipeId });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Resep sudah ada di favorit.' });
        }

        // Tambahkan ke favorit
        const favorite = await Favorite.create({ user: userId, recipe: recipeId });
        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menambahkan resep ke favorit.' });
    }
};

// Menghapus resep dari daftar favorit
exports.removeFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = req.params.id;

        // Hapus resep dari favorit
        const favorite = await Favorite.findOneAndDelete({ user: userId, recipe: recipeId });
        if (!favorite) {
            return res.status(404).json({ success: false, message: 'Resep tidak ditemukan di favorit.' });
        }

        res.status(200).json({ success: true, message: 'Resep berhasil dihapus dari favorit.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal menghapus resep dari favorit.' });
    }
};

// Mendapatkan kategori dari resep favorit
exports.getFavoriteCategories = async (req, res) => {
    try {
        const userId = req.user.id;

        // Cari resep favorit dan ambil kategorinya
        const favorites = await Favorite.find({ user: userId }).populate('recipe', 'category');
        const categories = favorites.map(favorite => favorite.recipe.category);

        // Hilangkan duplikat
        const uniqueCategories = [...new Set(categories)];
        res.status(200).json({ success: true, data: uniqueCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal mengambil kategori favorit.' });
    }
};
