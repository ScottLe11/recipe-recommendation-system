import { store } from './store.js';

/**
 * Get all user settings
 */
export function getUserSettings() {
  const settingsTable = store.getTable('settings');
  const settings = {};
  
  Object.entries(settingsTable).forEach(([key, row]) => {
    const value = row.value;
    
    // Parse special values
    if (key === 'dietary_restrictions') {
      settings[key] = JSON.parse(value || '[]');
    } else if (key === 'max_cooking_time' || key === 'calorie_goal' || key === 'max_sodium') {
      settings[key] = parseInt(value) || 0;
    } else {
      settings[key] = value;
    }
  });
  
  return settings;
}

/**
 * Get current context signals
 */
export function getCurrentContext() {
  const contextTable = store.getTable('context');
  const context = {};
  
  Object.entries(contextTable).forEach(([key, row]) => {
    const value = row.value;
    
    if (key === 'servings') {
      context[key] = parseInt(value) || 4;
    } else {
      context[key] = value;
    }
  });
  
  return context;
}

/**
 * Set skill level
 */
export function setSkillLevel(level) {
  // levels: 'beginner', 'intermediate', 'advanced'
  store.setRow('settings', 'skill_level', {
    key: 'skill_level',
    value: level
  });
}

/**
 * Set max cooking time
 */
export function setMaxCookingTime(minutes) {
  store.setRow('settings', 'max_cooking_time', {
    key: 'max_cooking_time',
    value: String(minutes)
  });
}

/**
 * Set preferred cuisine
 */
export function setPreferredCuisine(cuisine) {
  store.setRow('settings', 'preferred_cuisine', {
    key: 'preferred_cuisine',
    value: cuisine
  });
}

/**
 * Set dietary restrictions
 */
export function setDietaryRestrictions(restrictions) {
  // restrictions: array like ['vegetarian', 'gluten-free']
  store.setRow('settings', 'dietary_restrictions', {
    key: 'dietary_restrictions',
    value: JSON.stringify(restrictions)
  });
}

/**
 * Add dietary restriction
 */
export function addDietaryRestriction(restriction) {
  const settings = getUserSettings();
  const current = settings.dietary_restrictions || [];
  
  if (!current.includes(restriction)) {
    setDietaryRestrictions([...current, restriction]);
  }
}

/**
 * Remove dietary restriction
 */
export function removeDietaryRestriction(restriction) {
  const settings = getUserSettings();
  const current = settings.dietary_restrictions || [];
  setDietaryRestrictions(current.filter(r => r !== restriction));
}

/**
 * Set calorie goal
 */
export function setCalorieGoal(calories) {
  store.setRow('settings', 'calorie_goal', {
    key: 'calorie_goal',
    value: String(calories)
  });
}

/**
 * Set max sodium
 */
export function setMaxSodium(mg) {
  store.setRow('settings', 'max_sodium', {
    key: 'max_sodium',
    value: String(mg)
  });
}

/**
 * CONTEXT: Set time of day
 */
export function setTimeOfDay(timeOfDay) {
  // 'breakfast', 'lunch', 'dinner', 'snack'
  store.setRow('context', 'time_of_day', {
    key: 'time_of_day',
    value: timeOfDay
  });
}

/**
 * CONTEXT: Set weather
 */
export function setWeather(weather) {
  // 'hot', 'cold', 'rainy', etc.
  store.setRow('context', 'weather', {
    key: 'weather',
    value: weather
  });
}

/**
 * CONTEXT: Set number of servings
 */
export function setServings(servings) {
  store.setRow('context', 'servings', {
    key: 'servings',
    value: String(servings)
  });
}

/**
 * CONTEXT: Set meal type
 */
export function setMealType(mealType) {
  // 'quick', 'comfort', 'healthy', 'special'
  store.setRow('context', 'meal_type', {
    key: 'meal_type',
    value: mealType
  });
}

/**
 * Get user history
 */
export function getUserHistory() {
  const historyTable = store.getTable('history');
  return Object.entries(historyTable).map(([id, row]) => ({
    id,
    ...row
  })).sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Record user action on recipe
 */
export function recordAction(recipeId, action) {
  // action: 'liked', 'disliked', 'cooked', 'viewed'
  const id = `${recipeId}_${action}_${Date.now()}`;
  
  store.setRow('history', id, {
    recipe_id: recipeId,
    action,
    timestamp: Date.now()
  });
}

/**
 * Get liked recipes
 */
export function getLikedRecipes() {
  const history = getUserHistory();
  return history.filter(h => h.action === 'liked').map(h => h.recipe_id);
}

/**
 * Get disliked recipes
 */
export function getDislikedRecipes() {
  const history = getUserHistory();
  return history.filter(h => h.action === 'disliked').map(h => h.recipe_id);
}

/**
 * Check if recipe is liked
 */
export function isRecipeLiked(recipeId) {
  const liked = getLikedRecipes();
  return liked.includes(recipeId);
}

/**
 * Check if recipe is disliked
 */
export function isRecipeDisliked(recipeId) {
  const disliked = getDislikedRecipes();
  return disliked.includes(recipeId);
}
