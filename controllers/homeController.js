const db = require('../config/firestoreDb.js');

// Fungsi untuk mendapatkan rekomendasi berdasarkan popularitas
const getPopularRecipes = async (limit = 5) => {
    try {
        // Ambil resep dengan rating tertinggi dari Firestore
        const recipesRef = db.collection('recipes');
        const snapshot = await recipesRef
            .orderBy('rating', 'desc') // Mengurutkan berdasarkan rating
            .limit(20) // Ambil 20 resep dengan rating tertinggi
            .get();

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
    const { query } = req.query; // Mengambil query parameter dari URL

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    try {
        // Mengambil resep berdasarkan query pencarian
        const recipesRef = db.collection('recipes');
        const snapshot = await recipesRef
            .where('title', '>=', query)
            .where('title', '<=', query + '\uf8ff') // Pencarian di Firestore untuk matching
            .get();

        let recipes = [];
        snapshot.forEach(doc => {
            recipes.push({ id: doc.id, ...doc.data() });
        });

        if (recipes.length === 0) {
            return res.status(404).send('No recipes found');
        }

        // Kirimkan hasil pencarian resep
        res.status(200).send(recipes);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Internal server error');
    }
};

exports.search = async (req, res) => {
    const { query } = req.query; // Mengambil query parameter dari URL

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    try {
        // Mengambil resep berdasarkan query pencarian di ingredients
        const recipesRef = db.collection('recipes');
        const snapshot = await recipesRef
            .where('ingredients', 'array-contains', query) // Menggunakan Firestore "array-contains"
            .get();

        let recipes = [];
        snapshot.forEach(doc => {
            recipes.push({ id: doc.id, ...doc.data() });
        });

        if (recipes.length === 0) {
            return res.status(404).send('No recipes found for the given ingredient');
        }

        // Kirimkan hasil pencarian resep berdasarkan ingredients
        res.status(200).send(recipes);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Internal server error');
    }
};


// Get categories
exports.getCategories = async (req, res) => {
    try {
      const query = req.query.query;
      if (!query) {
        // Jika tidak ada query, kembalikan semua kategori yang terorganisir
        const categories = {
          protein: [
            'Chicken', 'Beef', 'Lamb', 'Shrimp', 'Squid', 'Crab', 
            'Tofu', 'Tempe', 'Egg', 'Fish'
          ],
          carbs: [
            'Oat', 'Rice', 'Corn', 'Potato', 'Cassava', 
            'Bread', 'Flour', 'Sago'
          ],
          vegetables: [
            'Spinach', 'Broccoli', 'Carrot', 'Bean', 'Tomato',
            'Cucumber', 'Cabbage', 'Eggplant'
          ],
          dairy_and_condiments: [
            'Milk', 'Cheese', 'Butter', 'Margarine', 'Yogurt',
            'Mayonnaise', 'Soy sauce', 'Oyster sauce', 'Chili',
            'Coconut milk', 'Vinegar', 'Shrimp paste'
          ],
          spices_and_herbs: [
            'Garlic', 'Onion', 'Chili', 'Curry', 'Coriander',
            'Lemongrass', 'Ginger'
          ]
        };

        return res.status(200).json({ 
          success: true, 
          data: categories 
        });
      }
  
      // Split query menjadi array dan bersihkan dari spasi
      const searchTerms = query.split(',').map(term => term.trim());
      
      const recipesRef = db.collection('recipes');
      const snapshot = await recipesRef.get();
  
      if (snapshot.empty) {
        return res.status(404).json({ 
          success: false, 
          message: 'No recipes found' 
        });
      }
  
      const matchingRecipes = [];
  
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Periksa apakah resep memiliki setidaknya satu dari searchTerms
        const hasMatchingCategory = Array.isArray(data.category) && 
          searchTerms.some(term => 
            data.category.some(cat => 
              cat.toLowerCase().includes(term.toLowerCase())
            )
          );
        
        const hasMatchingIngredient = Array.isArray(data.ingredients) && 
          searchTerms.some(term => 
            data.ingredients.some(ing => 
              ing.toLowerCase().includes(term.toLowerCase())
            )
          );

        if (hasMatchingCategory || hasMatchingIngredient) {
          matchingRecipes.push({ id: doc.id, ...data });
        }
      });
  
      if (matchingRecipes.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: `No recipes found for categories: ${searchTerms.join(', ')}` 
        });
      }
  
      res.status(200).json({ success: true, data: matchingRecipes });
    } catch (error) {
      console.error('Error getting categories with multiple terms:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
  
  
// Discover new recipes
exports.discover = async (req, res) => {
    try {
        // Ambil resep terbaru berdasarkan rating tertinggi
        const recipesRef = db.collection('recipes');
        const snapshot = await recipesRef
            .orderBy('rating', 'desc') // Mengurutkan berdasarkan rating tertinggi
            .limit(5) // Ambil 5 resep dengan rating tertinggi
            .get();

        let recipes = [];
        snapshot.forEach(doc => {
            recipes.push({ id: doc.id, ...doc.data() });
        });

        if (recipes.length === 0) {
            return res.status(404).send('No new recipes discovered');
        }

        // Kirimkan hasil penemuan resep
        res.status(200).json({
            message: 'Recipes Today discovered successfully',
            data: recipes,
        });
    } catch (error) {
        console.error('Error discovering new recipes:', error);
        res.status(500).json({
            message: 'Error discovering new recipes',
            error: error.message,
        });
    }
};
