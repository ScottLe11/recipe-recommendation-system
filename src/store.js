import { createStore } from 'tinybase';

// Create TinyBase store for recipes and user data
export const store = createStore();

// Initialize store tables and structure
store
  .setTablesSchema({
    recipes: {
      id: { type: 'string' },
      name: { type: 'string' },
      minutes: { type: 'number', default: 0 },
      tags: { type: 'string', default: '[]' },
      nutrition: { type: 'string', default: '[]' },
      n_steps: { type: 'number', default: 0 },
      steps: { type: 'string', default: '[]' },
      description: { type: 'string', default: '' },
      ingredients: { type: 'string', default: '[]' },
      n_ingredients: { type: 'number', default: 0 },
    },
    pantry: {
      name: { type: 'string' },
      quantity: { type: 'number', default: 1 },
      unit: { type: 'string', default: '' },
    },
    settings: {
      key: { type: 'string' },
      value: { type: 'string' },
    },
    context: {
      key: { type: 'string' },
      value: { type: 'string' },
    },
    history: {
      recipe_id: { type: 'string' },
      action: { type: 'string' }, // 'liked', 'disliked', 'cooked', 'viewed'
      timestamp: { type: 'number' },
    },
  });

// Initialize default settings
store.setRow('settings', 'skill_level', { key: 'skill_level', value: 'intermediate' });
store.setRow('settings', 'max_cooking_time', { key: 'max_cooking_time', value: '60' });
store.setRow('settings', 'preferred_cuisine', { key: 'preferred_cuisine', value: '' });
store.setRow('settings', 'dietary_restrictions', { key: 'dietary_restrictions', value: '[]' });
store.setRow('settings', 'calorie_goal', { key: 'calorie_goal', value: '2000' });
store.setRow('settings', 'max_sodium', { key: 'max_sodium', value: '2300' });

// Initialize default context
store.setRow('context', 'time_of_day', { key: 'time_of_day', value: '' });
store.setRow('context', 'weather', { key: 'weather', value: '' });
store.setRow('context', 'servings', { key: 'servings', value: '4' });
store.setRow('context', 'meal_type', { key: 'meal_type', value: '' });

console.log('Store initialized with tables: recipes, pantry, settings, context, history');
