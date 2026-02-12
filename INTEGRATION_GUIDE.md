# Integration Guide for UI Team

This guide shows how to integrate the recipe recommendation system with any UI framework (React, Vue, Angular, vanilla JS, etc.).

## Quick Start

```javascript
// Import the API
import RecipeAPI from './src/api.js';
// OR import individual functions:
// import { initialize, getRecommendations, addToPantry } from './src/api.js';

// 1. Initialize the system (do this once when app loads)
await RecipeAPI.initialize(1000);

// 2. Add ingredients to pantry
RecipeAPI.addToPantry('chicken');
RecipeAPI.addToPantry('rice');
RecipeAPI.addToPantry('tomatoes');

// 3. Set user preferences
RecipeAPI.setUserPreferences({
  skill_level: 'intermediate',
  max_cooking_time: 45,
  preferred_cuisine: 'italian',
  dietary_restrictions: ['vegetarian']
});

// 4. Set current context
RecipeAPI.setContext({
  time_of_day: 'dinner',
  weather: 'cold',
  servings: 4
});

// 5. Get recommendations!
const recommendations = RecipeAPI.getRecommendations({
  limit: 10,
  requireIngredientMatch: false,
  sortBy: 'score'
});

// Each recommendation includes:
// - Recipe data (name, ingredients, steps, nutrition, etc.)
// - Scores (totalScore, ingredientScore, preferenceScore, etc.)
// - explanation: ["✓ Great ingredient match", "Perfect for dinner", ...]
```

## Core Workflow

### 1. Initialization

```javascript
// Call once when app starts
const result = await RecipeAPI.initialize();
console.log(`Loaded ${result.recipeCount} recipes`);
```

### 2. Manage Pantry (What ingredients user has)

```javascript
// Add single ingredient
RecipeAPI.addToPantry('chicken', 2, 'lbs');

// Add multiple at once
RecipeAPI.addMultipleToPantry([
  'chicken',
  'rice',
  'onion',
  'garlic'
]);

// View pantry
const pantry = RecipeAPI.getPantry();
// Returns: [{id: '...', name: 'chicken', quantity: 2, unit: 'lbs'}, ...]

// Remove item
RecipeAPI.removeFromPantry('chicken');

// Clear all
RecipeAPI.clearPantry();
```

### 3. Set User Preferences (Personal model)

```javascript
RecipeAPI.setUserPreferences({
  skill_level: 'beginner',           // 'beginner', 'intermediate', 'advanced'
  max_cooking_time: 30,              // minutes
  preferred_cuisine: 'mexican',      // optional
  dietary_restrictions: ['vegan'],   // array of restrictions
  calorie_goal: 2000,                // daily calories
  max_sodium: 2300                   // mg per day
});

// Or set individual preferences
RecipeAPI.addDietaryRestriction('gluten-free');
RecipeAPI.removeDietaryRestriction('vegan');
```

### 4. Set Context (Current situation)

```javascript
RecipeAPI.setContext({
  time_of_day: 'breakfast',  // 'breakfast', 'lunch', 'dinner', 'snack'
  weather: 'hot',            // 'hot', 'cold', 'rainy'
  meal_type: 'quick',        // 'quick', 'comfort', 'healthy', 'special'
  servings: 2                // number of people
});
```

### 5. Get Recommendations (THE MAIN FUNCTION!)

```javascript
const recommendations = RecipeAPI.getRecommendations({
  limit: 20,                    // How many to return
  requireIngredientMatch: true, // Only show recipes with pantry ingredients
  sortBy: 'score'               // 'score', 'time', or 'match'
});

// Each recipe in the result has:
recommendations[0] = {
  // Basic recipe data
  id: '137739',
  name: 'Chicken Pasta Primavera',
  total_time: 35,
  difficulty: 'medium',
  cuisine: 'italian',
  
  // Ingredients & steps
  ingredients_array: ['chicken', 'pasta', 'tomatoes', ...],
  steps_array: ['Preheat oven...', 'Cook pasta...', ...],
  
  // Nutrition
  nutrition_parsed: {
    calories: 450,
    protein_g: 28,
    carbs_g: 45,
    sodium_mg: 580
  },
  
  // Dietary info
  dietary_tags: ['high-protein'],
  
  // SCORES (why this recipe was recommended)
  totalScore: 0.87,              // Overall match (0-1)
  ingredientScore: 0.75,         // How well it uses pantry items
  preferenceScore: 0.85,         // How well it matches preferences
  contextScore: 0.90,            // How well it fits current context
  nutritionScore: 0.80,          // How well it matches nutrition goals
  ingredientMatchPercentage: 75, // % of pantry ingredients used
  
  // EXPLANATIONS (show these to user!)
  explanation: [
    "✓ Great ingredient match (75%)",
    "✓ Matches your Italian cuisine preference",
    "Perfect for dinner",
    "Ready in 35 minutes"
  ]
}
```

### 6. Track User Actions (Feedback loop)

```javascript
// When user likes a recipe
RecipeAPI.likeRecipe(recipeId);

// When user dislikes a recipe
RecipeAPI.dislikeRecipe(recipeId);

// When user cooks a recipe
RecipeAPI.markAsCooked(recipeId);

// Get liked recipes (to personalize future recommendations)
const likedRecipes = RecipeAPI.getLikedRecipes();
```

## Example: Complete User Flow

```javascript
// User opens app
await RecipeAPI.initialize();

// User adds what they have in kitchen
RecipeAPI.addMultipleToPantry(['chicken', 'rice', 'broccoli', 'soy sauce']);

// User sets their preferences
RecipeAPI.setUserPreferences({
  skill_level: 'beginner',
  max_cooking_time: 30,
  dietary_restrictions: ['gluten-free']
});

// User indicates it's dinner time and they want something quick
RecipeAPI.setContext({
  time_of_day: 'dinner',
  meal_type: 'quick'
});

// Get recommendations
const recipes = RecipeAPI.getRecommendations({
  limit: 10,
  requireIngredientMatch: true,  // Only recipes with their ingredients
  sortBy: 'score'
});

// Display top recipe to user
console.log(recipes[0].name);
console.log('Why we recommend this:');
recipes[0].explanation.forEach(reason => console.log('  -', reason));

// User clicks "like"
RecipeAPI.likeRecipe(recipes[0].id);

// Future recommendations will be influenced by this like!
```

## Other Useful Functions

### Search

```javascript
// Search by text
const results = RecipeAPI.searchRecipes('chicken pasta');

// Search by specific ingredients
const results = RecipeAPI.searchByIngredients(['chicken', 'pasta']);

// Filter by criteria
const results = RecipeAPI.getRecipesByFilters({
  cuisine: 'italian',
  difficulty: 'easy',
  maxTime: 30,
  dietary: 'vegetarian'
});
```

### Get Similar Recipes

```javascript
// After user views a recipe, show similar ones
const similar = RecipeAPI.getSimilarRecipes(recipeId, 5);
```

### Utilities

```javascript
// Get all available cuisines
const cuisines = RecipeAPI.getAvailableCuisines();
// ['italian', 'asian', 'mexican', ...]

// Get dietary options
const dietary = RecipeAPI.getAvailableDietaryTags();
// ['vegetarian', 'vegan', 'gluten-free', ...]

// Get single recipe by ID
const recipe = RecipeAPI.getRecipe('137739');

// Export current state (for debugging)
const state = RecipeAPI.exportState();
```

## UI Display Examples

### Show Recommendation Card

```html
<div class="recipe-card">
  <h3>${recipe.name}</h3>
  <div class="meta">
    ⏱️ ${recipe.total_time} min • ${recipe.difficulty} • ${recipe.cuisine}
  </div>
  
  <!-- Match Score Bar -->
  <div class="score-bar">
    <div class="fill" style="width: ${recipe.totalScore * 100}%"></div>
    <span>${(recipe.totalScore * 100).toFixed(0)}% match</span>
  </div>
  
  <!-- Explanations -->
  <div class="explanations">
    ${recipe.explanation.map(reason => `
      <div class="reason">• ${reason}</div>
    `).join('')}
  </div>
  
  <!-- Nutrition -->
  <div class="nutrition">
    🔥 ${recipe.nutrition_parsed.calories} cal
    💪 ${recipe.nutrition_parsed.protein_g}g protein
  </div>
  
  <!-- Actions -->
  <button onclick="likeRecipe('${recipe.id}')">❤️ Like</button>
  <button onclick="viewDetails('${recipe.id}')">View Recipe</button>
</div>
```

### Show Recipe Detail

```javascript
const recipe = RecipeAPI.getRecipe(recipeId);

// Display:
// - recipe.name
// - recipe.description
// - recipe.ingredients_array (list of ingredients)
// - recipe.steps_array (numbered steps)
// - recipe.nutrition_parsed (nutritional info)
// - recipe.dietary_tags (badges)
```

## Framework-Specific Examples

### React

```jsx
import { useState, useEffect } from 'react';
import RecipeAPI from './src/api.js';

function App() {
  const [recipes, setRecipes] = useState([]);
  
  useEffect(() => {
    RecipeAPI.initialize().then(() => {
      // Add default ingredients
      RecipeAPI.addMultipleToPantry(['chicken', 'rice']);
      
      // Get recommendations
      const recs = RecipeAPI.getRecommendations({ limit: 10 });
      setRecipes(recs);
    });
  }, []);
  
  return (
    <div>
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

### Vue

```vue
<script>
import RecipeAPI from './src/api.js';

export default {
  data() {
    return {
      recipes: []
    };
  },
  async mounted() {
    await RecipeAPI.initialize();
    this.recipes = RecipeAPI.getRecommendations({ limit: 10 });
  },
  methods: {
    likeRecipe(id) {
      RecipeAPI.likeRecipe(id);
      // Refresh recommendations
      this.recipes = RecipeAPI.getRecommendations({ limit: 10 });
    }
  }
};
</script>
```

### Vanilla JS

```javascript
async function init() {
  await RecipeAPI.initialize();
  
  const recipes = RecipeAPI.getRecommendations({ limit: 10 });
  
  const container = document.getElementById('recipes');
  container.innerHTML = recipes.map(recipe => `
    <div class="recipe">
      <h3>${recipe.name}</h3>
      <div>${recipe.explanation.join(' • ')}</div>
    </div>
  `).join('');
}

init();
```

## Testing

Run the test file to verify everything works:

```bash
node scripts/testServices.js
```

## Key Takeaways for UI Team

1. **Import `src/api.js`** - this is your main interface
2. **Call `initialize()` once** when app starts
3. **Use `getRecommendations()`** - this is the core feature
4. **Display `explanation` array** - shows WHY each recipe is recommended
5. **Track user actions** (like/dislike) - improves personalization

The recommendation engine handles all the complex scoring, filtering, and ranking. Your UI just needs to collect user input and display the results!
