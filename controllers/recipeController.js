const { db } = require('../config/firestoreDb.js');
const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');


// Get all recipes
const getAllRecipes = async (req, res) => {
  try {
    const recipesSnapshot = await db.collection('recipes').get();
    const recipes = recipesSnapshot.docs.map((doc) => doc.data());
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
};

// Get recipe by ID
const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    const recipeRef = db.collection('recipes').doc(id);
    const recipeDoc = await recipeRef.get();

    if (!recipeDoc.exists) return res.status(404).json({ message: 'Recipe not found' });

    res.json(recipeDoc.data());
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
};

module.exports = { getAllRecipes, getRecipeById };
