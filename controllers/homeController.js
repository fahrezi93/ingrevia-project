const { db } = require('../config/firestoreDb.js'); // Pastikan konfigurasi Firestore sudah benar

// Fungsi untuk menghitung BMI
const calculateBMI = (weight, height) => {
    return weight / (height * height);
};

// Fungsi untuk menghitung TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (weight, height, age, gender, activityLevel) => {
    let tdee;
    if (gender === 'male') {
        tdee = 10 * weight + 6.25 * height * 100 - 5 * age + 5;
    } else {
        tdee = 10 * weight + 6.25 * height * 100 - 5 * age - 161;
    }
    
    const activityMultiplier = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    };
    tdee *= activityMultiplier[activityLevel] || 1.2;
    return tdee;
};

// Fungsi untuk mendapatkan kategori BMI
const getBMICategory = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi <= 24.9) return "Ideal";
    return "Overweight";
};

// Fungsi untuk mendapatkan resep berdasarkan kalori yang dibutuhkan
const getRecipesByCalories = async (targetCaloriesPerMeal) => {
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef.get();
    const recipes = [];
    
    snapshot.forEach(doc => {
        const recipe = doc.data();
        recipe.id = doc.id;  // Menambahkan ID resep
        recipes.push(recipe);
    });

    // Filter resep berdasarkan kalori yang mendekati targetCaloriesPerMeal
    const filteredRecipes = recipes.filter(recipe => Math.abs(recipe.calories - targetCaloriesPerMeal) < 100);

    // Urutkan resep berdasarkan rating tertinggi
    const sortedRecipes = filteredRecipes.sort((a, b) => b.rating - a.rating);

    return sortedRecipes;
};

// Get recommendations
exports.getRecommendations = async (req, res) => {
    const { weight, height, age, gender, activityLevel } = req.body;

    // Hitung BMI dan kategori BMI
    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    // Hitung TDEE (Total Daily Energy Expenditure)
    const tdee = calculateTDEE(weight, height, age, gender, activityLevel);

    // Hitung kalori target per hidangan (TDEE dibagi 3)
    const targetCaloriesPerMeal = tdee / 3;

    // Ambil resep berdasarkan kalori
    try {
        const sortedRecipes = await getRecipesByCalories(targetCaloriesPerMeal);

        // Jika ada resep yang ditemukan, pilih salah satu secara acak
        const recommendedRecipe = sortedRecipes.length > 0 ? sortedRecipes[0] : null;

        // Kirim response dengan informasi BMI, kategori, dan resep yang direkomendasikan
        res.json({
            bmi,
            bmiCategory,
            recommendedRecipe
        });
    } catch (error) {
        res.status(500).send('Error fetching recipes from Firestore: ' + error.message);
    }
};

// Search recipes
exports.search = async (req, res) => {
    const { query } = req.body;
    
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef.where('name', '>=', query).where('name', '<=', query + '\uf8ff').get();
    
    const results = [];
    snapshot.forEach(doc => {
        const recipe = doc.data();
        results.push(recipe);
    });

    res.json({ results });
};

// Get categories
exports.getCategories = async (req, res) => {
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();
    
    const categories = [];
    snapshot.forEach(doc => {
        categories.push(doc.data().name);
    });

    res.json({ categories });
};

// Discover new recipes
exports.discover = async (req, res) => {
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef.limit(5).get(); // Ambil 5 resep terbaru

    const newRecipes = [];
    snapshot.forEach(doc => {
        const recipe = doc.data();
        newRecipes.push(recipe);
    });

    res.json({ newRecipes });
};
