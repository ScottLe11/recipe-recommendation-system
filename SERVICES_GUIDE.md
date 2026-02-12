# Database Services Usage Guide

This guide shows how to use the database services in your UI components.

## Quick Start

```javascript
import { recipeService, pantryService, preferenceService, recommendations } from '../src/services';
```

---

## 1. Recipe Service

Search and filter recipes from the database.

### Get all recipes
```javascript
const allRecipes = recipeService.getAllRecipes();
console.log(`Total: ${allRecipes.length} recipes`);
```

### Search by name
```javascript
const results = recipeService.searchRecipesByName('chicken');
```

### Filter by criteria
```javascript
// Single filter
const italianRecipes = recipeService.getRecipesByCuisine('Italian');
const easyRecipes = recipeService.getRecipesByDifficulty('easy');
const quickRecipes = recipeService.getRecipesByMaxTime(30); // 30 minutes or less

// Multiple filters
const filteredRecipes = recipeService.filterRecipes({
  cuisine: 'Mexican',
  difficulty: 'easy',
  maxTime: 45,
  maxIngredients: 10,
  maxCalories: 500
});
```

### Search by ingredients
```javascript
const userIngredients = ['chicken', 'rice', 'tomato'];

// Recipes with ANY of these ingredients
const anyMatch = recipeService.searchRecipesByIngredients(userIngredients, false);

// Recipes with ALL of these ingredients
const allMatch = recipeService.searchRecipesByIngredients(userIngredients, true);

// Results include:
// - matchCount: how many ingredients matched
// - matchPercentage: percentage of user's ingredients in recipe
// - hasAllIngredients: boolean
```

### Sort recipes
```javascript
const recipes = recipeService.getAllRecipes();
const sorted = recipeService.sortRecipes(recipes, 'time', 'asc');
// sortBy options: 'time', 'ingredients', 'calories', 'name'
// order: 'asc' or 'desc'
```

### Get all cuisines
```javascript
const cuisines = recipeService.getAllCuisines();
// Returns: ['Mexican', 'Italian', 'Chinese', ...]
```

---

## 2. Pantry Service

Manage user's available ingredients.

### Add ingredients
```javascript
// Add single item
const itemId = pantryService.addPantryItem('Chicken', 2, 'lbs');

// Bulk add
pantryService.bulkAddPantryItems([
  { name: 'Tomatoes', quantity: 5, unit: 'count' },
  { name: 'Rice', quantity: 1, unit: 'cup' },
  { name: 'Olive Oil', quantity: 1, unit: 'bottle' }
]);
```

### Get pantry contents
```javascript
// Get all items
const items = pantryService.getAllPantryItems();

// Get just the names (for recipe matching)
const ingredientNames = pantryService.getPantryIngredientNames();
```

### Update quantities
```javascript
// Set specific quantity
pantryService.updatePantryQuantity(itemId, 5);

// Increment
pantryService.incrementPantryQuantity(itemId, 2); // +2

// Decrement (removes if reaches 0)
pantryService.decrementPantryQuantity(itemId, 1); // -1
```

### Remove items
```javascript
// Remove one item
pantryService.removePantryItem(itemId);

// Clear everything
pantryService.clearPantry();
```

### Search pantry
```javascript
// Find by name
const item = pantryService.findPantryItemByName('chicken');
if (item) {
  console.log(`Found: ${item.quantity} ${item.unit}`);
}
```

---

## 3. Preference Service

Manage user settings and context.

### User Settings

```javascript
// Get all settings
const settings = preferenceService.getUserSettings();

// Update skill level
preferenceService.setSkillLevel('intermediate'); // beginner, intermediate, advanced

// Update cuisine preference
preferenceService.setPreferredCuisine('Mexican');

// Update dietary constraints
preferenceService.setDietaryConstraints('vegetarian');

// Update multiple at once
preferenceService.updateUserSettings({
  skill_level: 'advanced',
  preferred_cuisine: 'Italian',
  dietary_constraints: 'none'
});
```

### Context (Time, Weather, Location)

```javascript
// Update context
preferenceService.setTimeOfDay('dinner'); // breakfast, lunch, dinner, snack
preferenceService.setWeather('cold'); // cold, hot, rainy, sunny
preferenceService.setLocation('San Francisco');

// Get context
const context = preferenceService.getCurrentContext();
console.log(`Time: ${context.time_of_day}, Weather: ${context.weather}`);
```

### Behavior Tracking

```javascript
// Track recipe view time (for learning user preferences)
const wasLingering = preferenceService.trackRecipeViewTime(recipeId, 8000); // 8 seconds

// Update satisfaction
preferenceService.updateSatisfactionScore(4.2);
```

---

## 4. Recommendation Engine

The smart part! Generates personalized recommendations.

### Get personalized recommendations
```javascript
const recs = recommendations.getRecommendations({
  extraIngredients: ['soy sauce'], // Optional: add ingredients beyond pantry
  useContext: true, // Factor in time of day, weather
  limit: 10 // How many recommendations
});

// Each recommendation includes:
// - All recipe data (name, ingredients, etc.)
// - recommendationScore: 0-100 score
// - scoreBreakdown: details of how score was calculated
// - extraIngredientsNeeded: how many ingredients user needs to buy
```

### Specialized recommendation functions

```javascript
// Quick & easy recipes (30 min or less)
const quickRecipes = recommendations.getQuickRecipes(10);

// Recipes you can make RIGHT NOW (100% ingredient match)
const readyNow = recommendations.getReadyToMakeRecipes(10);

// Almost ready (missing only 1-2 ingredients)
const almostReady = recommendations.getAlmostReadyRecipes(2, 10);

// Diverse variety
const diverse = recommendations.getDiverseRecommendations(10);
```

---

## Example: Complete User Flow

```javascript
import { 
  recipeService, 
  pantryService, 
  preferenceService, 
  recommendations 
} from '../src/services';

// 1. User adds ingredients to pantry
pantryService.addPantryItem('Chicken', 1, 'lb');
pantryService.addPantryItem('Rice', 2, 'cups');
pantryService.addPantryItem('Tomatoes', 3, 'count');

// 2. User sets preferences
preferenceService.setSkillLevel('beginner');
preferenceService.setPreferredCuisine('Mexican');

// 3. User updates context
preferenceService.setTimeOfDay('dinner');
preferenceService.setWeather('cold');

// 4. Get personalized recommendations
const myRecommendations = recommendations.getRecommendations({ limit: 5 });

console.log('Your top 5 recommendations:');
myRecommendations.forEach((recipe, i) => {
  console.log(`${i + 1}. ${recipe.name}`);
  console.log(`   Score: ${recipe.recommendationScore}`);
  console.log(`   Match: ${recipe.matchPercentage}%`);
  console.log(`   Need ${recipe.extraIngredientsNeeded} more ingredients`);
});

// 5. User views a recipe (track behavior)
const recipeId = myRecommendations[0].id;
const timeSpent = 12000; // 12 seconds
preferenceService.trackRecipeViewTime(recipeId, timeSpent);
```

---

## UI Integration Tips

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import { recommendations } from '../src/services';

function RecommendationsScreen() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      const recs = recommendations.getRecommendations({ limit: 10 });
      setRecipes(recs);
      setLoading(false);
    };
    
    loadRecommendations();
  }, []);
  
  if (loading) return <Text>Loading...</Text>;
  
  return (
    <ScrollView>
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </ScrollView>
  );
}
```

### Listen to Store Changes (with TinyBase hooks)
```javascript
import { useRow } from 'tinybase/ui-react';

function PantryDisplay() {
  // This automatically updates when pantry changes!
  const userSettings = useRow('personal_model', 'user_settings');
  
  return <Text>Skill Level: {userSettings.skill_level}</Text>;
}
```

---

## Testing Your Services

Open your app and try these in the console:

```javascript
// Test pantry
pantryService.addPantryItem('Test Ingredient');
console.log(pantryService.getAllPantryItems());

// Test recommendations
console.log(recommendations.getRecommendations({ limit: 3 }));

// Test recipe search
console.log(recipeService.searchRecipesByName('chicken'));
```
