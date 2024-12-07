const db = require('../config/firestoreDb.js');

// Mendapatkan daftar resep favorit user
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    // Mendapatkan koleksi 'favorites' milik user
    const snapshot = await db.collection('favorites').where('userId', '==', userId).get();
    if (snapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Format data hasil query
    const favorites = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar favorit.' });
  }
};

// Menambahkan resep ke daftar favorit
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.id;

    // Cek apakah resep sudah ada di favorit
    const snapshot = await db.collection('favorites').where('userId', '==', userId).where('recipeId', '==', recipeId).get();

    if (!snapshot.empty) {
      return res.status(400).json({ success: false, message: 'Resep sudah ada di favorit.' });
    }

    // Tambahkan ke favorit
    const newFavoriteRef = await db.collection('favorites').add({
      userId,
      recipeId,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true, data: { id: newFavoriteRef.id, userId, recipeId } });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan resep ke favorit.' });
  }
};

// Menghapus resep dari daftar favorit
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeId = req.params.id;

    // Cari dokumen favorit yang cocok
    const snapshot = await db.collection('favorites').where('userId', '==', userId).where('recipeId', '==', recipeId).get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: 'Resep tidak ditemukan di favorit.' });
    }

    // Hapus dokumen favorit
    const docId = snapshot.docs[0].id;
    await db.collection('favorites').doc(docId).delete();

    res.status(200).json({ success: true, message: 'Resep berhasil dihapus dari favorit.' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus resep dari favorit.' });
  }
};

// Mendapatkan kategori dari resep favorit
exports.getFavoriteCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ambil semua dokumen dari koleksi 'favorites' milik user
    const snapshot = await db.collection('favorites').where('userId', '==', userId).get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Ekstrak kategori resep dari data favorit
    const categories = snapshot.docs.map((doc) => doc.data().category);
    const uniqueCategories = [...new Set(categories)];

    res.status(200).json({ success: true, data: uniqueCategories });
  } catch (error) {
    console.error('Error getting favorite categories:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil kategori favorit.' });
  }
};
