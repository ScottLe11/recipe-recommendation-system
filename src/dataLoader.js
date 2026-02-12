import { store } from './store.js';
import { enrichRecipe } from './recipeParser.js';
import * as FileSystem from 'expo-file-system';

/**
 * Load recipes from JSON file into TinyBase store
 */
export async function loadRecipesFromCSV(maxRecipes = 1000) {
  try {
    console.log('Loading recipes from JSON...');
    
    // Read the recipes.json file (created by preprocessRecipes.js)
    const recipesPath = `${FileSystem.documentDirectory}../assets/recipes.json`;
    
    // For development, use require instead
    const recipesData = require('../assets/recipes.json');
    
    // Limit to maxRecipes
    const recipes = recipesData.slice(0, maxRecipes);
    
    console.log(`Processing ${recipes.length} recipes...`);
    
    let successCount = 0;
    
    // Load each recipe into TinyBase store
    recipes.forEach((recipe, idx) => {
      try {
        // Store raw recipe data (will be enriched when retrieved)
        const recipeId = recipe.id || `recipe_${idx}`;
        
        store.setRow('recipes', recipeId, {
          id: recipeId,
          name: recipe.name || '',
          minutes: parseInt(recipe.minutes) || 0,
          tags: recipe.tags || '[]',
          nutrition: recipe.nutrition || '[]',
          n_steps: parseInt(recipe.n_steps) || 0,
          steps: recipe.steps || '[]',
          description: recipe.description || '',
          ingredients: recipe.ingredients || '[]',
          n_ingredients: parseInt(recipe.n_ingredients) || 0,
        });
        
        successCount++;
      } catch (err) {
        console.warn(`Failed to process recipe ${idx}:`, err);
      }
    });
    
    console.log(`✓ Successfully loaded ${successCount} recipes into store`);
    return successCount;
    
  } catch (error) {
    console.error('Error loading recipes:', error);
    throw error;
  }
}

/**
 * Check if recipes are already loaded
 */
export function hasRecipes() {
  const recipes = store.getTable('recipes');
  return recipes && Object.keys(recipes).length > 0;
}

/**
 * Get recipe count
 */
export function getRecipeCount() {
  const recipes = store.getTable('recipes');
  return recipes ? Object.keys(recipes).length : 0;
}
