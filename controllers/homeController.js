// Fungsi untuk mendapatkan rekomendasi berdasarkan popularitas
const getPopularRecipes = async (limit = 5) => {
    try {
        // Ambil resep dengan rating tertinggi dari Firestore
        const recipesRef = db.collection('recipes');
        const snapshot = await recipesRef.orderBy('rating', 'desc').limit(20).get();

        let recipes = [];
        snapshot.forEach(doc => {
            recipes.push({ id: doc.id, ...doc.data() });
        });

        // Randomkan hasil agar ada variasi
        recipes = recipes.sort(() => Math.random() - 0.5);

        // Batasi hasil random sesuai parameter `limit`
        return recipes.slice(0, limit);
    } catch (error) {
        console.error('Error fetching popular recipes:', error);
        throw error;
    }
};

// Get recommendations
exports.getRecommendations = async (req, res) => {
    try {
        // Ambil rekomendasi berdasarkan popularitas
        const popularRecipes = await getPopularRecipes();

        // Kirimkan respons dengan data rekomendasi
        res.status(200).json({
            message: 'Recommendations fetched successfully',
            data: popularRecipes,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching recommendations',
            error: error.message,
        });
    }
};

// Search recipes
exports.search = async (req, res) => {
    // Search logic here...
    res.send('Search endpoint hit');
};

// Get categories
exports.getCategories = async (req, res) => {
    // Fetch categories logic here...
    res.send('Get categories endpoint hit');
};

// Discover new recipes
exports.discover = async (req, res) => {
    // Discover logic here...
    res.send('Discover endpoint hit');
};
