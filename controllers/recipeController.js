const { db } = require('../config/firebase');

// Get all recipes
const getAllRecipes = async (req, res) => {
  const recipesSnapshot = await db.collection('recipes').get();
  const recipes = recipesSnapshot.docs.map(doc => doc.data());

  res.json(recipes);
};

// Get recipe by ID
const getRecipeById = async (req, res) => {
  const { id } = req.params;
  const recipeRef = db.collection('recipes').doc(id);
  const recipeDoc = await recipeRef.get();

  if (!recipeDoc.exists) return res.status(404).json({ message: 'Recipe not found' });

  res.json(recipeDoc.data());
};

module.exports = { getAllRecipes, getRecipeById };
