/**
 * Utilities for parsing recipe data (nutrition, tags, ingredients)
 */

/**
 * Parse nutrition string from CSV format
 * Format: [calories, total_fat_PDV, sugar_PDV, sodium_PDV, protein_PDV, saturated_fat_PDV, carbohydrates_PDV]
 */
export function parseNutrition(nutritionStr) {
  try {
    if (!nutritionStr || nutritionStr === '') return null;
    
    let parsed = nutritionStr;
    if (typeof nutritionStr === 'string') {
      // Remove brackets and parse as array
      parsed = JSON.parse(nutritionStr.replace(/'/g, '"'));
    }
    
    if (!Array.isArray(parsed) || parsed.length < 7) return null;
    
    return {
      calories: parseFloat(parsed[0]) || 0,
      total_fat_pdv: parseFloat(parsed[1]) || 0,
      sugar_pdv: parseFloat(parsed[2]) || 0,
      sodium_pdv: parseFloat(parsed[3]) || 0,
      protein_pdv: parseFloat(parsed[4]) || 0,
      saturated_fat_pdv: parseFloat(parsed[5]) || 0,
      carbohydrates_pdv: parseFloat(parsed[6]) || 0,
      // Estimate actual grams (PDV = % daily value)
      protein_g: (parseFloat(parsed[4]) * 50 / 100) || 0, // 50g is typical daily value
      carbs_g: (parseFloat(parsed[6]) * 300 / 100) || 0, // 300g typical daily value
      sodium_mg: (parseFloat(parsed[3]) * 2300 / 100) || 0, // 2300mg daily value
    };
  } catch (error) {
    return null;
  }
}

/**
 * Parse tags array from string
 */
export function parseTags(tagsStr) {
  try {
    if (!tagsStr || tagsStr === '') return [];
    
    if (Array.isArray(tagsStr)) return tagsStr;
    
    if (typeof tagsStr === 'string') {
      // Handle various formats: "['tag1', 'tag2']" or '["tag1", "tag2"]'
      const parsed = JSON.parse(tagsStr.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Parse ingredients array from string
 */
export function parseIngredients(ingredientsStr) {
  try {
    if (!ingredientsStr || ingredientsStr === '') return [];
    
    if (Array.isArray(ingredientsStr)) return ingredientsStr;
    
    if (typeof ingredientsStr === 'string') {
      const parsed = JSON.parse(ingredientsStr.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Parse steps array from string
 */
export function parseSteps(stepsStr) {
  try {
    if (!stepsStr || stepsStr === '') return [];
    
    if (Array.isArray(stepsStr)) return stepsStr;
    
    if (typeof stepsStr === 'string') {
      const parsed = JSON.parse(stepsStr.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return [];
  } catch (error) {
    // Silently return empty array - steps will be handled elsewhere
    return [];
  }
}

/**
 * Calculate difficulty based on steps and time
 */
export function calculateDifficulty(nSteps, minutes) {
  const steps = parseInt(nSteps) || 0;
  const time = parseInt(minutes) || 0;
  
  // Difficulty scoring
  let score = 0;
  
  // More steps = harder
  if (steps <= 5) score += 0;
  else if (steps <= 10) score += 1;
  else if (steps <= 15) score += 2;
  else score += 3;
  
  // More time = harder
  if (time <= 20) score += 0;
  else if (time <= 45) score += 1;
  else if (time <= 90) score += 2;
  else score += 3;
  
  // Classify
  if (score <= 1) return 'easy';
  if (score <= 3) return 'medium';
  return 'hard';
}

/**
 * Determine cuisine from tags and name
 */
export function determineCuisine(tags, name) {
  const cuisineKeywords = {
    'italian': ['italian', 'pasta', 'pizza', 'lasagna', 'risotto', 'parmesan'],
    'asian': ['asian', 'chinese', 'japanese', 'thai', 'korean', 'stir-fry', 'soy-sauce'],
    'mexican': ['mexican', 'taco', 'burrito', 'enchilada', 'salsa', 'chipotle'],
    'american': ['american', 'burger', 'bbq', 'southern'],
    'mediterranean': ['mediterranean', 'greek', 'hummus', 'falafel'],
    'indian': ['indian', 'curry', 'masala', 'tikka', 'biryani'],
    'french': ['french', 'croissant', 'baguette', 'ratatouille'],
  };
  
  const nameLower = (name || '').toLowerCase();
  const tagsLower = (tags || []).map(t => t.toLowerCase()).join(' ');
  const combined = `${nameLower} ${tagsLower}`;
  
  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    if (keywords.some(kw => combined.includes(kw))) {
      return cuisine;
    }
  }
  
  return 'other';
}

/**
 * Check dietary restrictions
 */
export function getDietaryTags(tags, ingredients, name) {
  const dietary = [];
  
  const tagsLower = (tags || []).map(t => t.toLowerCase()).join(' ');
  const ingredientsLower = (ingredients || []).map(i => i.toLowerCase()).join(' ');
  const combined = `${tagsLower} ${ingredientsLower} ${name}`.toLowerCase();
  
  // Meat keywords
  const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'bacon', 'sausage', 'meat', 'ham'];
  const hasMeat = meatKeywords.some(kw => combined.includes(kw));
  
  // Dairy keywords
  const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy'];
  const hasDairy = dairyKeywords.some(kw => combined.includes(kw));
  
  // Gluten keywords
  const glutenKeywords = ['flour', 'bread', 'pasta', 'wheat', 'gluten'];
  const hasGluten = glutenKeywords.some(kw => combined.includes(kw));
  
  if (!hasMeat) {
    dietary.push('vegetarian');
    if (!hasDairy) {
      dietary.push('vegan');
    }
  }
  
  if (!hasGluten) dietary.push('gluten-free');
  if (!hasDairy) dietary.push('dairy-free');
  
  // Check tags for specific diets
  if (tagsLower.includes('keto') || tagsLower.includes('low-carb')) dietary.push('keto');
  if (tagsLower.includes('paleo')) dietary.push('paleo');
  if (tagsLower.includes('low-sodium')) dietary.push('low-sodium');
  
  return dietary;
}

/**
 * Enhanced recipe object with parsed fields
 */
export function enrichRecipe(recipe) {
  const tags = parseTags(recipe.tags);
  const ingredients = parseIngredients(recipe.ingredients);
  const steps = parseSteps(recipe.steps);
  const nutrition = parseNutrition(recipe.nutrition);
  const name = recipe.name || '';
  const minutes = parseInt(recipe.minutes) || 0;
  const nSteps = parseInt(recipe.n_steps) || 0;
  
  return {
    ...recipe,
    tags_array: tags,
    ingredients_array: ingredients,
    steps_array: steps,
    nutrition_parsed: nutrition,
    difficulty: calculateDifficulty(nSteps, minutes),
    cuisine: determineCuisine(tags, name),
    dietary_tags: getDietaryTags(tags, ingredients, name),
    total_time: minutes,
    num_ingredients: ingredients.length || parseInt(recipe.n_ingredients) || 0,
  };
}
