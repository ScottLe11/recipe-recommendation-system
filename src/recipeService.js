import { store } from './store.js';
import { enrichRecipe, parseIngredients, parseTags } from './recipeParser.js';

/**
 * Get all recipes from store
 */
export function getAllRecipes() {
  const recipesTable = store.getTable('recipes');
  return Object.entries(recipesTable).map(([id, recipe]) => enrichRecipe(recipe));
}

/**
 * Get recipe by ID
 */
export function getRecipeById(id) {
  const recipe = store.getRow('recipes', id);
  return recipe ? enrichRecipe(recipe) : null;
}

/**
 * Get total recipe count
 */
export function getRecipeCount() {
  const recipes = store.getTable('recipes');
  return Object.keys(recipes).length;
}

/**
 * Get recipes by cuisine
 */
export function getRecipesByCuisine(cuisine) {
  const allRecipes = getAllRecipes();
  return allRecipes.filter(r => r.cuisine.toLowerCase() === cuisine.toLowerCase());
}

/**
 * Get recipes by difficulty
 */
export function getRecipesByDifficulty(difficulty) {
  const allRecipes = getAllRecipes();
  return allRecipes.filter(r => r.difficulty === difficulty.toLowerCase());
}

/**
 * Get recipes under a maximum time
 */
export function getRecipesByMaxTime(maxMinutes) {
  const allRecipes = getAllRecipes();
  return allRecipes.filter(r => r.total_time <= maxMinutes);
}

/**
 * Get recipes by dietary restriction
 */
export function getRecipesByDietaryTag(dietaryTag) {
  const allRecipes = getAllRecipes();
  return allRecipes.filter(r => 
    r.dietary_tags && r.dietary_tags.includes(dietaryTag.toLowerCase())
  );
}

/**
 * Get recipes matching nutrition goals
 */
export function getRecipesByNutrition(options = {}) {
  const { maxCalories, minProtein, maxSodium, maxCarbs } = options;
  const allRecipes = getAllRecipes();
  
  return allRecipes.filter(recipe => {
    const nutrition = recipe.nutrition_parsed;
    if (!nutrition) return false;
    
    if (maxCalories && nutrition.calories > maxCalories) return false;
    if (minProtein && nutrition.protein_g < minProtein) return false;
    if (maxSodium && nutrition.sodium_mg > maxSodium) return false;
    if (maxCarbs && nutrition.carbs_g > maxCarbs) return false;
    
    return true;
  });
}

/**
 * Search recipes by ingredient list
 * Returns recipes with match score
 */
export function searchRecipesByIngredients(userIngredients, exactMatch = false) {
  if (!userIngredients || userIngredients.length === 0) {
    return [];
  }
  
  const allRecipes = getAllRecipes();
  const userIngredientsLower = userIngredients.map(i => i.toLowerCase().trim());
  
  const results = allRecipes.map(recipe => {
    const recipeIngredients = recipe.ingredients_array || [];
    const recipeIngredientsLower = recipeIngredients.map(i => i.toLowerCase());
    
    // Count how many user ingredients are in this recipe
    let matchCount = 0;
    const matchedIngredients = [];
    
    userIngredientsLower.forEach(userIng => {
      const found = recipeIngredientsLower.some(recipeIng => {
        // Partial match: check if user ingredient is part of recipe ingredient
        return recipeIng.includes(userIng) || userIng.includes(recipeIng);
      });
      
      if (found) {
        matchCount++;
        matchedIngredients.push(userIng);
      }
    });
    
    const matchPercentage = (matchCount / userIngredientsLower.length) * 100;
    const coveragePercentage = recipeIngredients.length > 0 
      ? (matchCount / recipeIngredients.length) * 100 
      : 0;
    
    return {
      ...recipe,
      matchCount,
      matchPercentage,
      coveragePercentage,
      matchedIngredients,
      missingIngredients: recipeIngredients.length - matchCount,
    };
  });
  
  // Filter and sort
  let filtered = results;
  
  if (exactMatch) {
    // Require all user ingredients to be present
    filtered = results.filter(r => r.matchPercentage === 100);
  } else {
    // Require at least one matching ingredient
    filtered = results.filter(r => r.matchCount > 0);
  }
  
  // Sort by match percentage, then by fewer missing ingredients
  return filtered.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return a.missingIngredients - b.missingIngredients;
  });
}

/**
 * Search recipes by text query (name, tags, description)
 */
export function searchRecipesByText(query) {
  if (!query || query.trim() === '') return [];
  
  const queryLower = query.toLowerCase();
  const allRecipes = getAllRecipes();
  
  return allRecipes.filter(recipe => {
    const name = (recipe.name || '').toLowerCase();
    const description = (recipe.description || '').toLowerCase();
    const tags = (recipe.tags_array || []).join(' ').toLowerCase();
    
    return name.includes(queryLower) || 
           description.includes(queryLower) || 
           tags.includes(queryLower);
  });
}

/**
 * Get random recipes (for discovery)
 */
export function getRandomRecipes(count = 10) {
  const allRecipes = getAllRecipes();
  const shuffled = [...allRecipes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
