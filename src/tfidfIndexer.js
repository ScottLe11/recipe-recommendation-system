/**
 * TF-IDF Indexing Layer
 * Builds TF-IDF vectors for all recipes and provides relevance scoring
 * Foundation for information retrieval before personalization
 */

import * as recipeService from './recipeService.js';

/**
 * Build TF-IDF index from all recipes
 * Returns vectorized index of all recipes
 */
export function buildTFIDFIndex() {
  const recipes = recipeService.getAllRecipes();
  
  // Step 1: Extract all documents (tokenized recipe data)
  const documents = recipes.map((recipe, idx) => ({
    id: recipe.id,
    tokens: extractTokens(recipe),
    recipe: recipe
  }));
  
  // Step 2: Build vocabulary (all unique terms)
  const vocabulary = new Set();
  documents.forEach(doc => {
    doc.tokens.forEach(token => vocabulary.add(token));
  });
  
  // Step 3: Calculate IDF for each term
  const idf = calculateIDF(documents, vocabulary);
  
  // Step 4: Build TF-IDF vectors for each document
  const index = documents.map(doc => ({
    id: doc.id,
    recipe: doc.recipe,
    tfIdfVector: calculateTFIDF(doc.tokens, idf, vocabulary),
    tokens: doc.tokens
  }));
  
  console.log(`✓ Built TF-IDF index for ${index.length} recipes with ${vocabulary.size} terms`);
  
  return {
    index,
    vocabulary: Array.from(vocabulary),
    idf,
    recipes
  };
}

/**
 * Extract and tokenize recipe content
 */
function extractTokens(recipe) {
  const tokens = [];
  
  // Recipe name (high importance)
  if (recipe.name) {
    tokens.push(...tokenize(recipe.name, 2)); // Weight name higher
  }
  
  // Ingredients (high importance)
  const ingredients = recipe.ingredients_array || [];
  ingredients.forEach(ing => {
    tokens.push(...tokenize(ing, 1.5)); // Weight ingredients
  });
  
  // Tags
  const tags = recipe.tags_array || [];
  tags.forEach(tag => {
    tokens.push(...tokenize(tag, 1.2));
  });
  
  // Cuisine and difficulty
  if (recipe.cuisine) tokens.push(...tokenize(recipe.cuisine, 1.3));
  if (recipe.difficulty) tokens.push(...tokenize(recipe.difficulty, 1.1));
  
  // Dietary tags
  const dietaryTags = recipe.dietary_tags || [];
  dietaryTags.forEach(tag => {
    tokens.push(...tokenize(tag, 1.2));
  });
  
  // Description
  if (recipe.description) {
    tokens.push(...tokenize(recipe.description, 0.8));
  }
  
  return tokens;
}

/**
 * Split text into tokens (simple tokenization)
 * Supports term weighting by frequency
 */
function tokenize(text, weight = 1) {
  if (!text) return [];
  
  // Convert to lowercase, remove special chars, split
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !isStopword(t));
  
  // Apply weight by repeating tokens
  const weighted = [];
  tokens.forEach(token => {
    const repeatCount = Math.ceil(weight);
    for (let i = 0; i < repeatCount; i++) {
      weighted.push(token);
    }
  });
  
  return weighted;
}

/**
 * Common English stop words to ignore
 */
function isStopword(token) {
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'per', 'add', 'mix', 'combine', 'use'
  ]);
  return stopwords.has(token);
}

/**
 * Calculate IDF (Inverse Document Frequency)
 * log(total_docs / docs_containing_term)
 */
function calculateIDF(documents, vocabulary) {
  const idf = {};
  const totalDocs = documents.length;
  
  vocabulary.forEach(term => {
    const docsWithTerm = documents.filter(doc => 
      doc.tokens.includes(term)
    ).length;
    
    // Avoid division by zero and log(0)
    idf[term] = Math.log((totalDocs + 1) / (docsWithTerm + 1));
  });
  
  return idf;
}

/**
 * Calculate TF-IDF vector for a document
 * Returns object with term -> score mappings
 */
function calculateTFIDF(tokens, idf, vocabulary) {
  const tf = {};
  const totalTokens = tokens.length;
  
  // Calculate term frequency
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  
  // Normalize TF and combine with IDF
  const tfIdf = {};
  Object.keys(tf).forEach(term => {
    const normalizedTF = tf[term] / totalTokens;
    tfIdf[term] = normalizedTF * (idf[term] || 0);
  });
  
  return tfIdf;
}

/**
 * Score a query against the index using TF-IDF cosine similarity
 * Returns ranked recipe IDs with relevance scores (0-1)
 */
export function scoreByTFIDF(queryText, index) {
  // Tokenize query
  const queryTokens = tokenize(queryText, 1);
  if (queryTokens.length === 0) return [];
  
  // Create query vector using IDF from index
  const queryVector = {};
  queryTokens.forEach(token => {
    queryVector[token] = (queryVector[token] || 0) + 1;
  });
  
  // Normalize query vector
  const queryNorm = Math.sqrt(
    Object.values(queryVector).reduce((sum, val) => sum + val * val, 0)
  );
  
  Object.keys(queryVector).forEach(term => {
    queryVector[term] /= queryNorm || 1;
  });
  
  // Score each recipe using cosine similarity
  const scores = index.map(doc => {
    // Cosine similarity = dot product / (magnitude1 * magnitude2)
    let dotProduct = 0;
    Object.keys(queryVector).forEach(term => {
      if (doc.tfIdfVector[term]) {
        dotProduct += queryVector[term] * doc.tfIdfVector[term];
      }
    });
    
    // Calculate magnitude of recipe vector
    const recipeMagnitude = Math.sqrt(
      Object.values(doc.tfIdfVector).reduce((sum, val) => sum + val * val, 0)
    );
    
    const cosineSimilarity = recipeMagnitude > 0 
      ? dotProduct / recipeMagnitude
      : 0;
    
    return {
      id: doc.id,
      recipe: doc.recipe,
      tfidfRelevance: Math.max(0, cosineSimilarity) // Clamp to 0-1
    };
  });
  
  return scores.sort((a, b) => b.tfidfRelevance - a.tfidfRelevance);
}

/**
 * Get ingredient relevance using TF-IDF
 * Better than naive substring matching
 */
export function scoreIngredientMatch(recipe, pantryIngredients, index) {
  if (!pantryIngredients || pantryIngredients.length === 0) {
    return 0.5;
  }
  
  const recipeIngredients = recipe.ingredients_array || [];
  if (recipeIngredients.length === 0) return 0;
  
  // Score each pantry ingredient's relevance to recipe
  let totalRelevance = 0;
  let matchedIngredients = 0;
  
  pantryIngredients.forEach(pantryIng => {
    // Find best matching recipe ingredient
    let bestMatch = 0;
    
    recipeIngredients.forEach(recipeIng => {
      // Tokenize both for comparison
      const pantryTokens = tokenize(pantryIng);
      const recipeTokens = tokenize(recipeIng);
      
      // Count matching tokens
      const matches = pantryTokens.filter(pt => 
        recipeTokens.some(rt => rt === pt)
      ).length;
      
      const similarity = matches / Math.max(pantryTokens.length, recipeTokens.length);
      bestMatch = Math.max(bestMatch, similarity);
    });
    
    if (bestMatch > 0) {
      totalRelevance += bestMatch;
      matchedIngredients++;
    }
  });
  
  // Score: quality of matches + coverage
  const matchQuality = matchedIngredients > 0 ? totalRelevance / matchedIngredients : 0;
  const coverage = matchedIngredients / pantryIngredients.length;
  
  // Weight coverage more (70%) than match quality (30%)
  return (coverage * 0.7) + (matchQuality * 0.3);
}

/**
 * Build a query from user context and preferences
 * Returns a text query for TF-IDF scoring
 */
export function buildContextQuery(context, preferences) {
  const queryParts = [];
  
  // Time of day terms
  if (context.time_of_day) {
    queryParts.push(context.time_of_day);
  }
  
  // Meal type terms
  if (context.meal_type) {
    queryParts.push(context.meal_type);
  }
  
  // Weather terms
  if (context.weather) {
    if (context.weather === 'hot') queryParts.push('cold', 'salad', 'chilled');
    if (context.weather === 'cold') queryParts.push('warm', 'soup', 'hot', 'baked');
    if (context.weather === 'rainy') queryParts.push('comfort', 'warm', 'soup');
  }
  
  // Preference terms
  if (preferences.preferred_cuisine) {
    queryParts.push(preferences.preferred_cuisine);
  }
  
  if (preferences.skill_level) {
    queryParts.push(preferences.skill_level);
  }
  
  // Dietary preferences
  if (preferences.dietary_restrictions && preferences.dietary_restrictions.length > 0) {
    queryParts.push(...preferences.dietary_restrictions);
  }
  
  return queryParts.join(' ');
}

/**
 * Explain TF-IDF relevance in human-readable terms
 */
export function explainTFIDFScore(recipe, queryText, tfIDFScore) {
  if (tfIDFScore > 0.7) {
    return `Highly relevant match for "${queryText}"`;
  } else if (tfIDFScore > 0.4) {
    return `Moderate match for "${queryText}"`;
  } else if (tfIDFScore > 0.1) {
    return `Some relevance to "${queryText}"`;
  } else {
    return `Limited relevance to "${queryText}"`;
  }
}
