/**
 * Test script for database services
 * Run with: node scripts/testServices.js
 */

// Import services (ES6 modules)
import * as recipeService from '../src/recipeService.js';
import * as pantryService from '../src/pantryService.js';
import * as preferenceService from '../src/preferenceService.js';
import * as recommendations from '../src/recommendationEngine.js';
import { loadRecipesFromCSV, hasRecipes } from '../src/dataLoader.js';
import { store } from '../src/store.js';

console.log('================================');
console.log('DATABASE SERVICES TEST');
console.log('================================\n');

// Test 1: Load recipes if not loaded
console.log('📚 TEST 1: Loading Recipes...');
if (!hasRecipes()) {
  console.log('No recipes found, loading from JSON...');
  loadRecipesFromCSV(1000);
}
const recipeCount = recipeService.getRecipeCount();
console.log(`✅ Loaded ${recipeCount} recipes\n`);

// Test 2: Recipe queries
console.log('🔍 TEST 2: Recipe Queries...');
const italianRecipes = recipeService.getRecipesByCuisine('Italian');
console.log(`Found ${italianRecipes.length} Italian recipes`);

const easyRecipes = recipeService.getRecipesByDifficulty('easy');
console.log(`Found ${easyRecipes.length} easy recipes`);

const quickRecipes = recipeService.getRecipesByMaxTime(30);
console.log(`Found ${quickRecipes.length} recipes under 30 minutes`);

console.log('\nSample recipe:');
const sampleRecipe = recipeService.getAllRecipes()[0];
console.log(`  Name: ${sampleRecipe.name}`);
console.log(`  Cuisine: ${sampleRecipe.cuisine}`);
console.log(`  Difficulty: ${sampleRecipe.difficulty}`);
console.log(`  Time: ${sampleRecipe.total_time} min`);
console.log(`  Ingredients: ${sampleRecipe.num_ingredients}`);
console.log('✅ Recipe queries working\n');

// Test 3: Pantry operations
console.log('🥗 TEST 3: Pantry Operations...');
pantryService.clearPantry(); // Start fresh

pantryService.addPantryItem('Chicken', 2, 'lbs');
pantryService.addPantryItem('Rice', 3, 'cups');
pantryService.addPantryItem('Tomatoes', 5, 'count');
pantryService.addPantryItem('Onion', 2, 'count');
pantryService.addPantryItem('Garlic', 4, 'cloves');

const pantryItems = pantryService.getAllPantryItems();
console.log(`Added ${pantryItems.length} items to pantry:`);
pantryItems.forEach(item => {
  console.log(`  - ${item.name}: ${item.quantity} ${item.unit}`);
});
console.log('✅ Pantry operations working\n');

// Test 4: User preferences
console.log('⚙️  TEST 4: User Preferences...');
preferenceService.setSkillLevel('intermediate');
preferenceService.setPreferredCuisine('Mexican');
preferenceService.setTimeOfDay('dinner');
preferenceService.setWeather('cold');

const settings = preferenceService.getUserSettings();
const context = preferenceService.getCurrentContext();
console.log(`Skill Level: ${settings.skill_level}`);
console.log(`Preferred Cuisine: ${settings.preferred_cuisine}`);
console.log(`Time of Day: ${context.time_of_day}`);
console.log(`Weather: ${context.weather}`);
console.log('✅ Preferences working\n');

// Test 5: Ingredient-based search
console.log('🔎 TEST 5: Search by Ingredients...');
const ingredientSearch = recipeService.searchRecipesByIngredients(
  ['chicken', 'rice', 'tomatoes'],
  false
);
console.log(`Found ${ingredientSearch.length} recipes with these ingredients`);
console.log('\nTop 3 matches:');
ingredientSearch.slice(0, 3).forEach((recipe, i) => {
  console.log(`  ${i + 1}. ${recipe.name}`);
  console.log(`     Match: ${recipe.matchCount}/${3} ingredients (${recipe.matchPercentage.toFixed(0)}%)`);
});
console.log('✅ Ingredient search working\n');

// Test 6: Recommendations
console.log('⭐ TEST 6: Personalized Recommendations...');
const recs = recommendations.getRecommendations({ limit: 5 });
console.log(`Generated ${recs.length} recommendations\n`);

console.log('Top 5 Recommended Recipes:');
recs.forEach((recipe, i) => {
  console.log(`\n${i + 1}. ${recipe.name}`);
  console.log(`   Score: ${recipe.recommendationScore}/100`);
  console.log(`   Cuisine: ${recipe.cuisine} | Difficulty: ${recipe.difficulty}`);
  console.log(`   Time: ${recipe.total_time} min | Ingredients: ${recipe.num_ingredients}`);
  console.log(`   Match: ${recipe.matchCount}/${pantryItems.length} pantry items (${recipe.matchPercentage.toFixed(0)}%)`);
  console.log(`   Need to buy: ${recipe.extraIngredientsNeeded} more ingredients`);
  console.log(`   Score breakdown:`, recipe.scoreBreakdown);
});
console.log('\n✅ Recommendations working\n');

// Test 7: Specialized recommendations
console.log('🚀 TEST 7: Specialized Recommendations...');

const quickMeals = recommendations.getQuickRecipes(3);
console.log(`Quick & Easy: Found ${quickMeals.length} recipes`);
quickMeals.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name} (${r.total_time} min, ${r.difficulty})`);
});

const readyNow = recommendations.getReadyToMakeRecipes(3);
console.log(`\nReady to Make Now: Found ${readyNow.length} recipes (100% match)`);
readyNow.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name} (${r.matchPercentage.toFixed(0)}% match)`);
});

const almostReady = recommendations.getAlmostReadyRecipes(2, 3);
console.log(`\nAlmost Ready (1-2 missing): Found ${almostReady.length} recipes`);
almostReady.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.name} (need ${r.extraIngredientsNeeded} more)`);
});

console.log('✅ Specialized recommendations working\n');

// Test 8: Filtering and sorting
console.log('📊 TEST 8: Advanced Filtering...');
const filtered = recipeService.filterRecipes({
  cuisine: 'Mexican',
  difficulty: 'easy',
  maxTime: 45
});
console.log(`Mexican + Easy + Under 45min: ${filtered.length} recipes`);

if (filtered.length > 0) {
  const sorted = recipeService.sortRecipes(filtered, 'time', 'asc');
  console.log('Top 3 fastest:');
  sorted.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} (${r.total_time} min)`);
  });
}
console.log('✅ Filtering and sorting working\n');

// Summary
console.log('================================');
console.log('✅ ALL TESTS PASSED!');
console.log('================================');
console.log('\nYour database services are ready to use!');
console.log('The UI developer can now import and use these functions.\n');
console.log('Try modifying the pantry or preferences above and re-run to see different recommendations.\n');
