/**
 * Simple demo of the Recipe Recommendation Engine
 * Run with: node demo.js
 * 
 * This demonstrates the recommendation engine
 * without UI or Expo dependencies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pantryService from './src/pantryService.js';
import * as preferenceService from './src/preferenceService.js';
import * as recipeService from './src/recipeService.js';
import { getRecommendations, initializeRecommendationEngine } from './src/recommendationEngine.js';
import { store } from './src/store.js';
import { enrichRecipe, parseNutrition } from './src/recipeParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load recipes directly into store
function loadRecipesIntoStore(limit = 100) {
  const recipesPath = path.join(__dirname, 'assets', 'recipes.json');
  const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  
  console.log(`Loading ${Math.min(limit, recipes.length)} recipes into store...`);
  
  let count = 0;
  for (let i = 0; i < Math.min(limit, recipes.length); i++) {
    const recipe = recipes[i];
    try {
      const recipeId = recipe.id || `recipe_${i}`;
      store.setRow('recipes', recipeId, {
        id: recipeId,
        name: recipe.name || 'Unknown',
        minutes: Number(recipe.minutes) || 0,
        tags: typeof recipe.tags === 'string' ? recipe.tags : JSON.stringify(recipe.tags || []),
        nutrition: typeof recipe.nutrition === 'string' ? recipe.nutrition : JSON.stringify(recipe.nutrition || []),
        n_steps: Number(recipe.n_steps) || 0,
        steps: typeof recipe.steps === 'string' ? recipe.steps : JSON.stringify(recipe.steps || []),
        description: recipe.description || '',
        ingredients: typeof recipe.ingredients === 'string' ? recipe.ingredients : JSON.stringify(recipe.ingredients || []),
        n_ingredients: Number(recipe.n_ingredients) || 0,
      });
      count++;
    } catch (err) {
      // Silently skip problematic recipes
    }
  }
  
  console.log(`✓ Loaded ${count} recipes into store`);
  return count;
}

// Main demo
function runDemo() {
  console.log('='.repeat(60));
  console.log('RECIPE RECOMMENDATION ENGINE - DEMO');
  console.log('='.repeat(60));
  console.log();

  // Load all recipes into store
  console.log('📚 Loading recipes...');
  loadRecipesIntoStore(100);
  const allRecipes = recipeService.getAllRecipes();
  console.log(`✓ Loaded ${allRecipes.length} recipes from store`);
  
  // Initialize the TF-IDF index
  console.log('🔍 Building TF-IDF index...');
  initializeRecommendationEngine();
  console.log();

  // Setup user profile
  console.log('🥗 Setting up user profile...');
  const pantryItems = ['chicken', 'rice', 'tomato', 'onion', 'garlic', 'olive oil', 'salt', 'pepper'];
  pantryService.addMultipleIngredients(pantryItems);
  console.log(`✓ Added ${pantryItems.length} items to pantry`);
  
  // Set preferences
  preferenceService.setSkillLevel('intermediate');
  preferenceService.setMaxCookingTime(45);
  preferenceService.setPreferredCuisine('italian');
  preferenceService.setCalorieGoal(2200);
  console.log(`✓ Set skill level to: intermediate`);
  console.log(`✓ Set max cooking time: 45 min`);
  console.log(`✓ Set preferred cuisine: italian`);
  console.log(`✓ Set calorie goal: 2200`);
  
  // Set context
  preferenceService.setTimeOfDay('dinner');
  preferenceService.setWeather('cold');
  preferenceService.setMealType('comfort');
  console.log(`✓ Set context: comfort dinner (cold weather)`);
  console.log();

  // Get recommendations
  console.log(' Getting recommendations...');
  const recommendations = getRecommendations({
    limit: 5,
    requireIngredientMatch: false,
    sortBy: 'score'
  });
  console.log(`✓ Found ${recommendations.length} recommendations\n`);

  // Display top 5
  console.log('='.repeat(60));
  console.log('TOP 5 RECOMMENDED RECIPES');
  console.log('='.repeat(60));

  recommendations.forEach((recipe, index) => {
    console.log();
    console.log(`${index + 1}. ${recipe.name}`);
    console.log('-'.repeat(60));
    console.log(`   ⏱️  Time: ${recipe.minutes} minutes`);
    console.log(`   📊 Difficulty: ${recipe.difficulty || 'unknown'}`);
    console.log(`   🍽️  Cuisine: ${recipe.cuisine || 'unknown'}`);
    console.log(`   🎯 Overall Score: ${(recipe.totalScore * 100).toFixed(0)}%`);
    
    console.log();
    console.log(`   Score Components:`);
    if (recipe.ingredientScore !== undefined) {
      console.log(`     • Ingredient Match: ${(recipe.ingredientScore * 100).toFixed(0)}% (35% weight)`);
    }
    if (recipe.preferenceScore !== undefined) {
      console.log(`     • Preference Match: ${(recipe.preferenceScore * 100).toFixed(0)}% (25% weight)`);
    }
    if (recipe.contextScore !== undefined) {
      console.log(`     • Context Match: ${(recipe.contextScore * 100).toFixed(0)}% (20% weight)`);
    }
    if (recipe.nutritionScore !== undefined) {
      console.log(`     • Nutrition Match: ${(recipe.nutritionScore * 100).toFixed(0)}% (20% weight)`);
    }
    
    if (recipe.nutrition_parsed) {
      console.log();
      const nutri = recipe.nutrition_parsed;
      console.log(`   📈 Nutrition: ${Math.round(nutri.calories)} cal, ${Math.round(nutri.protein_g)}g protein, ${Math.round(nutri.sodium_mg)}mg sodium`);
    }
    
    if (recipe.dietary_tags && recipe.dietary_tags.length > 0) {
      console.log(`   🏷️  Dietary Tags: ${recipe.dietary_tags.join(', ')}`);
    }
  });

  console.log();
  console.log('='.repeat(60));
  console.log('DEMO COMPLETE');
  console.log('='.repeat(60));
  console.log();
  console.log('✨ The recommendation engine scored all recipes and ranked them!');
  console.log();
}

// Run the demo
try {
  runDemo();
} catch (err) {
  console.error('❌ Error running demo:', err.message);
  console.error(err.stack);
  process.exit(1);
}
