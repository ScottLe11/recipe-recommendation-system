# Project Architecture

## Overview

This recipe recommendation system has a **clean separation between business logic and UI**. Your teammate can build any UI on top of the `src/` services.

## Architecture Layers

```
┌─────────────────────────────────────────┐
│           UI LAYER (Your Teammate)      │
│  (React, Vue, Angular, Vanilla JS)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         API INTERFACE (src/api.js)      │
│  Clean functions for UI to call         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      SERVICE LAYER (src/*.js)           │
│  - recommendationEngine.js (CORE!)      │
│  - recipeService.js                     │
│  - pantryService.js                     │
│  - preferenceService.js                 │
│  - userProfile.js                       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         DATA LAYER                      │
│  - store.js (TinyBase)                  │
│  - dataLoader.js                        │
│  - recipeParser.js                      │
└─────────────────────────────────────────┘
```

## Key Files

### 🎯 For Your Teammate (UI)

- **`src/api.js`** - Main API interface (import this!)
- **`INTEGRATION_GUIDE.md`** - Complete integration documentation
- **`demo.js`** - Working example (run: `npm run demo`)

### 🧠 Core Logic (You maintain this)

- **`src/recommendationEngine.js`** - Ranking algorithm (most important!)
  - Multi-factor scoring
  - Explanation generation
  - Filter logic
  
- **`src/recipeService.js`** - Recipe queries
- **`src/pantryService.js`** - Pantry management
- **`src/preferenceService.js`** - User settings & context
- **`src/userProfile.js`** - User model interface

### 📦 Data Files

- **`assets/recipes.json`** - 1000 recipes from Food.com dataset
- **`scripts/preprocessRecipes.js`** - Convert CSV to JSON
- **`scripts/build_index.py`** - Build search indices

## Data Flow

### 1. User Input → Services
```javascript
// UI collects user input
const ingredients = ['chicken', 'rice'];
const preferences = { skill_level: 'beginner', max_cooking_time: 30 };

// Call API functions
RecipeAPI.addMultipleToPantry(ingredients);
RecipeAPI.setUserPreferences(preferences);
```

### 2. Services → Recommendation Engine
```javascript
// Recommendation engine reads from services
const userSettings = preferenceService.getUserSettings();
const pantryIngredients = pantryService.getPantryIngredientNames();
const context = preferenceService.getCurrentContext();
```

### 3. Engine → Ranked Results
```javascript
// Engine scores each recipe
recipes.forEach(recipe => {
  const scores = {
    ingredientScore: calculateIngredientMatch(recipe, pantryIngredients),
    preferenceScore: calculatePreferenceMatch(recipe, userSettings),
    contextScore: calculateContextMatch(recipe, context),
    nutritionScore: calculateNutritionMatch(recipe, userSettings)
  };
  
  const totalScore = 
    0.35 * scores.ingredientScore +
    0.25 * scores.preferenceScore +
    0.20 * scores.contextScore +
    0.20 * scores.nutritionScore;
    
  recipe.totalScore = totalScore;
  recipe.explanation = generateExplanation(recipe, scores);
});
```

### 4. Results → UI
```javascript
// UI displays ranked results
const recommendations = RecipeAPI.getRecommendations({ limit: 10 });

recommendations.forEach(recipe => {
  displayRecipeCard({
    name: recipe.name,
    score: recipe.totalScore,
    reasons: recipe.explanation,
    nutrition: recipe.nutrition_parsed
  });
});
```

## What Your Teammate Needs to Know

### 1. Import the API
```javascript
import RecipeAPI from './src/api.js';
```

### 2. Initialize Once
```javascript
await RecipeAPI.initialize();
```

### 3. Call Functions as Needed
```javascript
// When user adds ingredient
RecipeAPI.addToPantry(ingredient);

// When user sets preference
RecipeAPI.setUserPreferences({ max_cooking_time: 30 });

// When user wants recommendations
const recipes = RecipeAPI.getRecommendations({ limit: 10 });
```

### 4. Display Results
```javascript
recipes.forEach(recipe => {
  // Show recipe card with:
  // - recipe.name
  // - recipe.explanation (array of reasons)
  // - recipe.totalScore (0-1, convert to percentage)
  // - recipe.nutrition_parsed
});
```

## Testing Without UI

### Run Demo
```bash
npm run demo
```

This shows recommendations in the console with no UI needed.

### Run Tests
```bash
npm test
```

This tests all services independently.

## Recommendation Algorithm

### Scoring Formula
```
Total Score = 
  35% × Ingredient Match +
  25% × User Preferences +
  20% × Context Fit +
  20% × Nutrition Goals
```

### Components

1. **Ingredient Match (35%)**
   - Coverage: % of recipe ingredients user has
   - Utilization: % of pantry items used

2. **Preference Match (25%)**
   - Cuisine preference
   - Skill level match
   - Similar to liked recipes

3. **Context Match (20%)**
   - Time of day (breakfast/lunch/dinner)
   - Weather (hot/cold/rainy)
   - Meal type (quick/comfort/healthy/special)

4. **Nutrition Match (20%)**
   - Calorie goal alignment
   - Sodium limits
   - Protein content

### Explanation Generation

For each recipe, the engine generates human-readable reasons:
- "✓ Great ingredient match (85%)"
- "✓ Matches your Italian cuisine preference"
- "Perfect for dinner"
- "Quick to make (25 min)"
- "Low calorie (350 cal)"

## Storage

### Current: TinyBase (In-Memory)
- Fast, simple
- Data lost on page refresh (unless localStorage available)
- Good for demo/prototype

### Future Options for Your Teammate:
- **LocalStorage**: Browser persistent storage
- **IndexedDB**: Better for large datasets
- **Backend API**: Centralized database
- **Firebase**: Real-time sync across devices

The storage layer is replaceable - just update `src/store.js` and the services will continue working.

## CS 125 Requirements Met

✅ **Personal Model**: User preferences, dietary restrictions, goals, history  
✅ **Context**: Time of day, weather, meal type, servings  
✅ **Data Ingestion**: 1000 recipes from Food.com dataset  
✅ **Search/Ranking**: Multi-factor scoring algorithm  
✅ **Explanations**: Human-readable reasons for each recommendation  
✅ **Feedback Loop**: Like/dislike affects future recommendations  

## For Your Demo/Presentation

Focus on:
1. **The recommendation engine** (`src/recommendationEngine.js`)
   - Show the scoring formula
   - Explain how it combines multiple signals
   
2. **Explanations** (`generateExplanation()` function)
   - Show how transparent the system is
   - Each recommendation has clear reasoning
   
3. **Personalization**
   - Run demo with different preferences
   - Show how results change based on context
   
4. **Live demo** (use `demo.js`)
   - Add ingredients → get recommendations
   - Change context → see different results
   - Like recipes → improve recommendations

## Next Steps

1. **Your teammate builds UI** using `src/api.js`
2. **You focus on the algorithm** in `src/recommendationEngine.js`
3. **Test together** using `demo.js` to verify integration
4. **Tune the weights** in the scoring formula if needed
5. **Prepare demo** showing before/after personalization

The core logic is done and working. UI is now plug-and-play!
