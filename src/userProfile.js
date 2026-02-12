/**
 * User Profile Module
 * Manages user preferences, goals, and history
 * Integrates with preferenceService for persistence
 */

import * as preferenceService from './preferenceService.js';

/**
 * Get complete user profile
 */
export function getUserProfile() {
  const settings = preferenceService.getUserSettings();
  const history = preferenceService.getUserHistory();
  const likedRecipes = preferenceService.getLikedRecipes();
  const dislikedRecipes = preferenceService.getDislikedRecipes();
  
  return {
    preferences: {
      dietaryRestrictions: settings.dietary_restrictions || [],
      preferredCuisine: settings.preferred_cuisine || '',
      maxCookingTime: settings.max_cooking_time || 60,
      skillLevel: settings.skill_level || 'intermediate',
    },
    nutritionGoals: {
      dailyCalories: settings.calorie_goal || 2000,
      maxSodium: settings.max_sodium || 2300,
    },
    history: {
      likedRecipes,
      dislikedRecipes,
      allHistory: history,
    }
  };
}

/**
 * Update user profile (bulk update)
 */
export function updateUserProfile(updates) {
  if (updates.preferences) {
    const { dietaryRestrictions, preferredCuisine, maxCookingTime, skillLevel } = updates.preferences;
    
    if (dietaryRestrictions !== undefined) {
      preferenceService.setDietaryRestrictions(dietaryRestrictions);
    }
    if (preferredCuisine !== undefined) {
      preferenceService.setPreferredCuisine(preferredCuisine);
    }
    if (maxCookingTime !== undefined) {
      preferenceService.setMaxCookingTime(maxCookingTime);
    }
    if (skillLevel !== undefined) {
      preferenceService.setSkillLevel(skillLevel);
    }
  }
  
  if (updates.nutritionGoals) {
    const { dailyCalories, maxSodium } = updates.nutritionGoals;
    
    if (dailyCalories !== undefined) {
      preferenceService.setCalorieGoal(dailyCalories);
    }
    if (maxSodium !== undefined) {
      preferenceService.setMaxSodium(maxSodium);
    }
  }
}

/**
 * Get user context for current session
 */
export function getUserContext() {
  return preferenceService.getCurrentContext();
}

/**
 * Update user context
 */
export function updateUserContext(updates) {
  if (updates.timeOfDay !== undefined) {
    preferenceService.setTimeOfDay(updates.timeOfDay);
  }
  if (updates.weather !== undefined) {
    preferenceService.setWeather(updates.weather);
  }
  if (updates.servings !== undefined) {
    preferenceService.setServings(updates.servings);
  }
  if (updates.mealType !== undefined) {
    preferenceService.setMealType(updates.mealType);
  }
}

export default {
  getUserProfile,
  updateUserProfile,
  getUserContext,
  updateUserContext,
};