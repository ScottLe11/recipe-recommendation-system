/**
 * Recommendation Engine
 * Ranks recipes based on user preferences, context, pantry, and history
 * 
 * Architecture:
 * 1. TF-IDF IR Layer (baseline relevance)
 * 2. Personalization Layer (preferences, context, nutrition)
 * 3. Final ranking (combined scores)
 */

import * as recipeService from './recipeService.js';
import * as pantryService from './pantryService.js';
import * as preferenceService from './preferenceService.js';
import { 
  buildTFIDFIndex, 
  scoreByTFIDF, 
  scoreIngredientMatch,
  buildContextQuery,
  explainTFIDFScore
} from './tfidfIndexer.js';

// Global TF-IDF index (built once)
let tfidfIndex = null;

/**
 * Initialize the TF-IDF index (call once on startup)
 */
export function initializeRecommendationEngine() {
  tfidfIndex = buildTFIDFIndex();
  console.log('✓ Recommendation engine initialized with TF-IDF indexing');
  return tfidfIndex;
}

/**
 * Ensure index is initialized
 */
function ensureIndexInitialized() {
  if (!tfidfIndex) {
    tfidfIndex = buildTFIDFIndex();
  }
}

/**
 * Main recommendation function
 * Returns top-ranked recipes with explanations
 * 
 * Process:
 * 1. Get TF-IDF baseline relevance
 * 2. Apply hard filters
 * 3. Layer personalization scores on top
 * 4. Generate explanations
 */
export function getRecommendations(options = {}) {
  ensureIndexInitialized();
  
  const {
    limit = 10,
    requireIngredientMatch = false,
    sortBy = 'score',
    userQuery = null // Optional: explicit search query
  } = options;
  
  // Get user data
  const userSettings = preferenceService.getUserSettings();
  const context = preferenceService.getCurrentContext();
  const pantryIngredients = pantryService.getPantryIngredientNames();
  const likedRecipes = preferenceService.getLikedRecipes();
  const dislikedRecipes = preferenceService.getDislikedRecipes();
  
  console.log('=== RECOMMENDATION ENGINE ===');
  console.log('Step 1: TF-IDF IR Baseline');
  
  // STEP 1: Get TF-IDF baseline relevance
  // Start with neutral scores for all recipes
  let candidates = tfidfIndex.index.map(doc => ({
    ...doc.recipe,
    tfidfScore: 0.5 // Default neutral baseline
  }));
  
  // If user provided a query, score based on that
  if (userQuery) {
    const tfidfScores = scoreByTFIDF(userQuery, tfidfIndex.index);
    const scoreMap = new Map(tfidfScores.map(s => [s.id, s.tfidfRelevance]));
    candidates = candidates.map(r => ({
      ...r,
      tfidfScore: scoreMap.get(r.id) || 0.5
    }));
  } else {
    // Use context-based query for TF-IDF if no explicit query
    const contextQuery = buildContextQuery(context, userSettings);
    if (contextQuery && contextQuery.trim().length > 0) {
      const tfidfScores = scoreByTFIDF(contextQuery, tfidfIndex.index);
      const scoreMap = new Map(tfidfScores.map(s => [s.id, s.tfidfRelevance]));
      candidates = candidates.map(r => {
        const contextScore = scoreMap.get(r.id) || 0;
        return {
          ...r,
          // Use context-based TF-IDF score if available, otherwise neutral
          tfidfScore: contextScore > 0 ? contextScore * 0.6 + 0.5 * 0.4 : 0.5
        };
      });
    }
  }
  
  const avgTFIDF = candidates.reduce((s, r) => s + (r.tfidfScore || 0.5), 0) / candidates.length;
  console.log(`TF-IDF baseline: ${candidates.length} recipes (avg score: ${avgTFIDF.toFixed(3)})`);
  
  // STEP 2: Apply hard filters
  console.log('Step 2: Hard Filters');
  candidates = applyFilters(candidates, userSettings, context);
  console.log(`After filters: ${candidates.length} recipes`);
  
  // STEP 3: Layer personalization on top of TF-IDF
  console.log('Step 3: Personalization Layer');
  const scored = candidates.map(recipe => {
    const personalizationScores = calculatePersonalizationScores(recipe, {
      userSettings,
      context,
      pantryIngredients,
      likedRecipes
    });
    
    // Ensure all scores are valid numbers
    const tScore = recipe.tfidfScore || 0.5;
    const iScore = personalizationScores.ingredientScore || 0;
    const pScore = personalizationScores.preferenceScore || 0;
    const cScore = personalizationScores.contextScore || 0;
    const nScore = personalizationScores.nutritionScore || 0;
    
    // Combine TF-IDF baseline with personalization
    const combinedScore = (
      tScore * 0.3 +           // IR relevance baseline (30%)
      iScore * 0.25 +
      pScore * 0.20 +
      cScore * 0.15 +
      nScore * 0.10
    );
    
    return {
      ...recipe,
      ...personalizationScores,
      totalScore: Math.max(0, Math.min(combinedScore, 1)), // Clamp to 0-1
      explanation: generateExplanation(recipe, personalizationScores, context, userSettings, tScore)
    };
  });
  
  // Filter out disliked recipes
  const filtered = scored.filter(r => !dislikedRecipes.includes(r.id));
  
  // Filter by ingredient match if required
  if (requireIngredientMatch && pantryIngredients.length > 0) {
    filtered = filtered.filter(r => r.ingredientScore > 0);
  }
  
  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'time') return a.total_time - b.total_time;
    if (sortBy === 'match') return b.ingredientScore - a.ingredientScore;
    return b.totalScore - a.totalScore;
  });
  
  console.log(`Final results: ${Math.min(limit, filtered.length)} recommendations\n`);
  return filtered.slice(0, limit);
}

/**
 * Apply hard filters (must-match requirements)
 */
function applyFilters(recipes, userSettings, context) {
  let filtered = recipes;
  
  // Max cooking time (only if user set a limit)
  if (userSettings.max_cooking_time && userSettings.max_cooking_time > 0 && userSettings.max_cooking_time < 1000) {
    filtered = filtered.filter(r => r.total_time <= userSettings.max_cooking_time);
  }
  
  // Dietary restrictions (only if user has restrictions)
  const dietaryRestrictions = userSettings.dietary_restrictions || [];
  if (dietaryRestrictions.length > 0) {
    filtered = filtered.filter(recipe => {
      // Recipe must match ALL dietary restrictions
      return dietaryRestrictions.every(restriction => 
        recipe.dietary_tags && recipe.dietary_tags.includes(restriction)
      );
    });
  }
  
  // Skill level filter (more lenient - only filter if beginner)
  if (userSettings.skill_level === 'beginner') {
    filtered = filtered.filter(r => r.difficulty === 'easy' || r.difficulty === 'medium');
  }
  // Don't filter for intermediate or advanced - show all difficulties
  
  // Nutrition filters (only if user set specific goals)
  if (userSettings.calorie_goal && userSettings.calorie_goal > 0 && userSettings.calorie_goal < 10000) {
    filtered = filtered.filter(r => {
      if (!r.nutrition_parsed) return true; // Include if no nutrition data
      // Allow recipes within 300 cal of goal per meal
      return r.nutrition_parsed.calories <= (userSettings.calorie_goal / 3) + 300;
    });
  }
  
  if (userSettings.max_sodium && userSettings.max_sodium > 0 && userSettings.max_sodium < 100000) {
    filtered = filtered.filter(r => {
      if (!r.nutrition_parsed) return true; // Include if no nutrition data
      return r.nutrition_parsed.sodium_mg <= userSettings.max_sodium;
    });
  }
  
  return filtered;
}

/**
 * Calculate personalization scores (preference, context, nutrition, ingredients)
 * These layer on top of the TF-IDF baseline
 */
function calculatePersonalizationScores(recipe, userData) {
  const { userSettings, context, pantryIngredients, likedRecipes } = userData;
  
  // 1. Ingredient Match Score using TF-IDF (0-1)
  const ingredientScore = scoreIngredientMatch(recipe, pantryIngredients, tfidfIndex.index);
  
  // 2. Preference Score (0-1)
  const preferenceScore = calculatePreferenceScore(recipe, userSettings, likedRecipes);
  
  // 3. Context Score (0-1)
  const contextScore = calculateContextScore(recipe, context);
  
  // 4. Nutrition Score (0-1)
  const nutritionScore = calculateNutritionScore(recipe, userSettings);
  
  return {
    ingredientScore,
    preferenceScore,
    contextScore,
    nutritionScore,
    ingredientMatchPercentage: pantryIngredients.length > 0 ? (ingredientScore * 100) : 0
  };
}

/**
 * Calculate how well recipe matches user preferences
 */
function calculatePreferenceScore(recipe, userSettings, likedRecipes) {
  let score = 0.5; // Start neutral
  
  // Preferred cuisine bonus
  if (userSettings.preferred_cuisine && userSettings.preferred_cuisine !== '') {
    if (recipe.cuisine === userSettings.preferred_cuisine.toLowerCase()) {
      score += 0.3;
    }
  }
  
  // Similar to liked recipes (collaborative filtering lite)
  if (likedRecipes && likedRecipes.length > 0) {
    if (likedRecipes.includes(recipe.id)) {
      score += 0.2; // Already liked
    }
  }
  
  // Difficulty match
  const skillLevelDifficulty = {
    'beginner': 'easy',
    'intermediate': 'medium',
    'advanced': 'hard'
  };
  
  const preferredDifficulty = skillLevelDifficulty[userSettings.skill_level] || 'medium';
  if (recipe.difficulty === preferredDifficulty) {
    score += 0.1;
  }
  
  return Math.min(score, 1); // Cap at 1
}

/**
 * Calculate how well recipe fits current context
 */
function calculateContextScore(recipe, context) {
  let score = 0.5; // Start neutral
  
  // Time of day matching
  if (context.time_of_day) {
    const timeKeywords = {
      'breakfast': ['breakfast', 'pancake', 'waffle', 'omelette', 'cereal', 'toast'],
      'lunch': ['sandwich', 'salad', 'soup', 'wrap'],
      'dinner': ['dinner', 'main', 'entree'],
      'snack': ['snack', 'appetizer', 'bite']
    };
    
    const keywords = timeKeywords[context.time_of_day.toLowerCase()] || [];
    const recipeName = recipe.name.toLowerCase();
    const recipeTags = (recipe.tags_array || []).join(' ').toLowerCase();
    
    const matches = keywords.some(kw => recipeName.includes(kw) || recipeTags.includes(kw));
    if (matches) score += 0.2;
  }
  
  // Weather matching
  if (context.weather) {
    const weatherKeywords = {
      'hot': ['cold', 'salad', 'chilled', 'iced', 'frozen'],
      'cold': ['warm', 'hot', 'soup', 'stew', 'baked', 'roasted'],
      'rainy': ['comfort', 'soup', 'stew', 'warm']
    };
    
    const keywords = weatherKeywords[context.weather.toLowerCase()] || [];
    const recipeName = recipe.name.toLowerCase();
    const recipeTags = (recipe.tags_array || []).join(' ').toLowerCase();
    
    const matches = keywords.some(kw => recipeName.includes(kw) || recipeTags.includes(kw));
    if (matches) score += 0.15;
  }
  
  // Meal type matching
  if (context.meal_type) {
    const mealTypeKeywords = {
      'quick': () => recipe.total_time <= 30,
      'comfort': () => {
        const name = recipe.name.toLowerCase();
        return name.includes('comfort') || name.includes('classic') || name.includes('traditional');
      },
      'healthy': () => {
        return recipe.dietary_tags && 
               (recipe.dietary_tags.includes('low-calorie') || 
                recipe.dietary_tags.includes('vegetarian'));
      },
      'special': () => recipe.difficulty === 'hard' || recipe.total_time > 60
    };
    
    const matcher = mealTypeKeywords[context.meal_type.toLowerCase()];
    if (matcher && matcher()) {
      score += 0.15;
    }
  }
  
  return Math.min(score, 1);
}

/**
 * Calculate nutrition score based on user goals
 */
function calculateNutritionScore(recipe, userSettings) {
  const nutrition = recipe.nutrition_parsed;
  if (!nutrition) return 0.5; // Neutral if no nutrition data
  
  let score = 0.5;
  
  // Calorie goal
  if (userSettings.calorie_goal && userSettings.calorie_goal > 0) {
    const calorieGoal = userSettings.calorie_goal / 3; // Per meal
    const calorieDiff = Math.abs(nutrition.calories - calorieGoal);
    const calorieScore = Math.max(0, 1 - (calorieDiff / calorieGoal));
    score += calorieScore * 0.3;
  }
  
  // Protein bonus (higher is generally better)
  if (nutrition.protein_g > 20) {
    score += 0.1;
  }
  
  // Sodium penalty if too high
  if (userSettings.max_sodium && nutrition.sodium_mg > userSettings.max_sodium * 0.8) {
    score -= 0.1;
  }
  
  return Math.max(0, Math.min(score, 1));
}

/**
 * Generate human-readable explanation for recommendation
 * Includes TF-IDF baseline relevance
 */
function generateExplanation(recipe, scores, context, userSettings, tfidfScore = 0) {
  const reasons = [];
  
  // TF-IDF baseline relevance
  if (tfidfScore > 0.6) {
    reasons.push(`✓ Highly relevant to your context`);
  } else if (scores.contextScore > 0.7) {
    reasons.push(`✓ Perfect match for ${context.meal_type || context.time_of_day || 'your situation'}`);
  }
  
  // Ingredient match
  if (scores.ingredientScore > 0.7) {
    reasons.push(`✓ Great ingredient match (${scores.ingredientMatchPercentage.toFixed(0)}%)`);
  } else if (scores.ingredientScore > 0.4) {
    reasons.push(`Good use of your pantry items`);
  }
  
  // Preference match
  if (scores.preferenceScore > 0.7) {
    if (userSettings.preferred_cuisine && recipe.cuisine === userSettings.preferred_cuisine.toLowerCase()) {
      reasons.push(`✓ Matches your ${recipe.cuisine} cuisine preference`);
    } else {
      reasons.push(`✓ Matches your preferences`);
    }
  }

  // Nutrition
  if (scores.nutritionScore > 0.7) {
    if (recipe.nutrition_parsed) {
      if (recipe.nutrition_parsed.calories < 400) {
        reasons.push(`Low calorie (${recipe.nutrition_parsed.calories.toFixed(0)} cal)`);
      }
      if (recipe.nutrition_parsed.protein_g > 25) {
        reasons.push(`High protein (${recipe.nutrition_parsed.protein_g.toFixed(0)}g)`);
      }
    }
  }
  
  // Difficulty
  if (recipe.difficulty === 'easy') {
    reasons.push(`Easy to make`);
  }
  
  // Time
  if (recipe.total_time <= 20) {
    reasons.push(`Ready in ${recipe.total_time} minutes`);
  }
  
  return reasons.length > 0 ? reasons : ['Recommended for you'];
}

/**
 * Get similar recipes to a given recipe
 */
export function getSimilarRecipes(recipeId, limit = 5) {
  const targetRecipe = recipeService.getRecipeById(recipeId);
  if (!targetRecipe) return [];
  
  const allRecipes = recipeService.getAllRecipes();
  
  // Score similarity
  const scored = allRecipes
    .filter(r => r.id !== recipeId)
    .map(recipe => {
      let similarityScore = 0;
      
      // Same cuisine
      if (recipe.cuisine === targetRecipe.cuisine) similarityScore += 0.3;
      
      // Same difficulty
      if (recipe.difficulty === targetRecipe.difficulty) similarityScore += 0.2;
      
      // Similar time
      const timeDiff = Math.abs(recipe.total_time - targetRecipe.total_time);
      if (timeDiff <= 15) similarityScore += 0.2;
      
      // Shared dietary tags
      const sharedDietary = (recipe.dietary_tags || []).filter(tag => 
        (targetRecipe.dietary_tags || []).includes(tag)
      );
      similarityScore += sharedDietary.length * 0.1;
      
      return { ...recipe, similarityScore };
    });
  
  scored.sort((a, b) => b.similarityScore - a.similarityScore);
  return scored.slice(0, limit);
}
