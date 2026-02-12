/**
 * API Interface for Recipe Recommendation System
 * 
 * This file provides a clean interface for the UI to interact with
 * the recommendation engine and all services.
 * 
 * Your teammate can import these functions and call them from any UI framework.
 */

// Import all services
import * as recipeService from './recipeService.js';
import * as pantryService from './pantryService.js';
import * as preferenceService from './preferenceService.js';
import * as recommendationEngine from './recommendationEngine.js';
import { loadRecipesFromCSV, hasRecipes } from './dataLoader.js';
import { store } from './store.js';

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the system - load recipes if needed
 * Call this once when the app starts
 */
export async function initialize(maxRecipes = 1000) {
  if (!hasRecipes()) {
    await loadRecipesFromCSV(maxRecipes);
  }
  return {
    recipeCount: recipeService.getRecipeCount(),
    message: 'System initialized successfully'
  };
}

// ============================================================================
// RECIPE QUERIES
// ============================================================================

/**
 * Get all recipes
 */
export function getAllRecipes() {
  return recipeService.getAllRecipes();
}

/**
 * Get recipe by ID
 */
export function getRecipe(id) {
  return recipeService.getRecipeById(id);
}

/**
 * Search recipes by text (name, tags, description)
 */
export function searchRecipes(query) {
  return recipeService.searchRecipesByText(query);
}

/**
 * Search recipes by ingredients
 */
export function searchByIngredients(ingredients, exactMatch = false) {
  return recipeService.searchRecipesByIngredients(ingredients, exactMatch);
}

/**
 * Get recipes by filters
 */
export function getRecipesByFilters({ cuisine, difficulty, maxTime, dietary }) {
  let results = recipeService.getAllRecipes();
  
  if (cuisine) {
    results = results.filter(r => r.cuisine === cuisine);
  }
  if (difficulty) {
    results = results.filter(r => r.difficulty === difficulty);
  }
  if (maxTime) {
    results = results.filter(r => r.total_time <= maxTime);
  }
  if (dietary) {
    results = results.filter(r => r.dietary_tags && r.dietary_tags.includes(dietary));
  }
  
  return results;
}

// ============================================================================
// PANTRY MANAGEMENT
// ============================================================================

/**
 * Get all pantry items
 */
export function getPantry() {
  return pantryService.getAllPantryItems();
}

/**
 * Add ingredient to pantry
 */
export function addToPantry(name, quantity = 1, unit = '') {
  return pantryService.addPantryItem(name, quantity, unit);
}

/**
 * Remove ingredient from pantry
 */
export function removeFromPantry(id) {
  return pantryService.removePantryItem(id);
}

/**
 * Clear all pantry items
 */
export function clearPantry() {
  return pantryService.clearPantry();
}

/**
 * Add multiple ingredients at once
 */
export function addMultipleToPantry(ingredients) {
  return pantryService.addMultipleIngredients(ingredients);
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

/**
 * Get all user settings
 */
export function getUserSettings() {
  return preferenceService.getUserSettings();
}

/**
 * Update user preferences
 * Example: setUserPreferences({ skill_level: 'beginner', max_cooking_time: 30 })
 */
export function setUserPreferences(updates) {
  if (updates.skill_level) preferenceService.setSkillLevel(updates.skill_level);
  if (updates.max_cooking_time) preferenceService.setMaxCookingTime(updates.max_cooking_time);
  if (updates.preferred_cuisine) preferenceService.setPreferredCuisine(updates.preferred_cuisine);
  if (updates.dietary_restrictions) preferenceService.setDietaryRestrictions(updates.dietary_restrictions);
  if (updates.calorie_goal) preferenceService.setCalorieGoal(updates.calorie_goal);
  if (updates.max_sodium) preferenceService.setMaxSodium(updates.max_sodium);
  
  return getUserSettings();
}

/**
 * Add dietary restriction
 */
export function addDietaryRestriction(restriction) {
  return preferenceService.addDietaryRestriction(restriction);
}

/**
 * Remove dietary restriction
 */
export function removeDietaryRestriction(restriction) {
  return preferenceService.removeDietaryRestriction(restriction);
}

// ============================================================================
// CONTEXT (Explicit signals that affect recommendations)
// ============================================================================

/**
 * Get current context
 */
export function getContext() {
  return preferenceService.getCurrentContext();
}

/**
 * Set context for recommendations
 * Example: setContext({ time_of_day: 'dinner', weather: 'cold', servings: 4 })
 */
export function setContext(updates) {
  if (updates.time_of_day) preferenceService.setTimeOfDay(updates.time_of_day);
  if (updates.weather) preferenceService.setWeather(updates.weather);
  if (updates.servings) preferenceService.setServings(updates.servings);
  if (updates.meal_type) preferenceService.setMealType(updates.meal_type);
  
  return getContext();
}

// ============================================================================
// USER HISTORY (Implicit signals)
// ============================================================================

/**
 * Record that user liked a recipe
 */
export function likeRecipe(recipeId) {
  return preferenceService.recordAction(recipeId, 'liked');
}

/**
 * Record that user disliked a recipe
 */
export function dislikeRecipe(recipeId) {
  return preferenceService.recordAction(recipeId, 'disliked');
}

/**
 * Record that user cooked a recipe
 */
export function markAsCooked(recipeId) {
  return preferenceService.recordAction(recipeId, 'cooked');
}

/**
 * Record that user viewed a recipe
 */
export function markAsViewed(recipeId) {
  return preferenceService.recordAction(recipeId, 'viewed');
}

/**
 * Get user's liked recipes
 */
export function getLikedRecipes() {
  return preferenceService.getLikedRecipes();
}

/**
 * Get user's full history
 */
export function getUserHistory() {
  return preferenceService.getUserHistory();
}

// ============================================================================
// RECOMMENDATIONS (The main feature!)
// ============================================================================

/**
 * Get personalized recipe recommendations
 * 
 * @param {Object} options - Recommendation options
 * @param {number} options.limit - Number of recommendations to return (default: 10)
 * @param {boolean} options.requireIngredientMatch - Only show recipes with pantry ingredients (default: false)
 * @param {string} options.sortBy - Sort method: 'score', 'time', or 'match' (default: 'score')
 * 
 * @returns {Array} Ranked recipes with scores and explanations
 * 
 * Each result includes:
 * - All recipe fields (name, ingredients, steps, nutrition, etc.)
 * - totalScore: Overall match score (0-1)
 * - ingredientScore, preferenceScore, contextScore, nutritionScore: Component scores
 * - ingredientMatchPercentage: % of pantry ingredients used
 * - explanation: Array of reasons why this recipe was recommended
 */
export function getRecommendations(options = {}) {
  return recommendationEngine.getRecommendations(options);
}

/**
 * Get similar recipes to a given recipe
 */
export function getSimilarRecipes(recipeId, limit = 5) {
  return recommendationEngine.getSimilarRecipes(recipeId, limit);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get recipe count
 */
export function getRecipeCount() {
  return recipeService.getRecipeCount();
}

/**
 * Get available cuisines
 */
export function getAvailableCuisines() {
  const recipes = recipeService.getAllRecipes();
  const cuisines = new Set(recipes.map(r => r.cuisine).filter(c => c && c !== 'other'));
  return Array.from(cuisines).sort();
}

/**
 * Get available dietary tags
 */
export function getAvailableDietaryTags() {
  return ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-sodium'];
}

/**
 * Export current state (for debugging or saving)
 */
export function exportState() {
  return {
    pantry: getPantry(),
    settings: getUserSettings(),
    context: getContext(),
    history: getUserHistory(),
    recipeCount: getRecipeCount()
  };
}

// ============================================================================
// DEFAULT EXPORT (all functions as one object)
// ============================================================================

export default {
  // Initialization
  initialize,
  
  // Recipe queries
  getAllRecipes,
  getRecipe,
  searchRecipes,
  searchByIngredients,
  getRecipesByFilters,
  
  // Pantry
  getPantry,
  addToPantry,
  removeFromPantry,
  clearPantry,
  addMultipleToPantry,
  
  // Preferences
  getUserSettings,
  setUserPreferences,
  addDietaryRestriction,
  removeDietaryRestriction,
  
  // Context
  getContext,
  setContext,
  
  // History
  likeRecipe,
  dislikeRecipe,
  markAsCooked,
  markAsViewed,
  getLikedRecipes,
  getUserHistory,
  
  // Recommendations (MAIN FEATURE)
  getRecommendations,
  getSimilarRecipes,
  
  // Utilities
  getRecipeCount,
  getAvailableCuisines,
  getAvailableDietaryTags,
  exportState
};
