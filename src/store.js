import { createStore } from 'tinybase';
import * as FileSystem from 'expo-file-system/legacy';

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

const USER_DATA_FILE = `${FileSystem.documentDirectory}users.json`;
console.log(`User data file path: ${USER_DATA_FILE}`);
let currentUser = null;

function resetUserStateToDefaults() {
  // Clear user-specific tables
  store.delTable('pantry');
  store.delTable('history');

  // Reset settings
  store.setRow('settings', 'skill_level', { key: 'skill_level', value: 'intermediate' });
  store.setRow('settings', 'max_cooking_time', { key: 'max_cooking_time', value: '60' });
  store.setRow('settings', 'preferred_cuisine', { key: 'preferred_cuisine', value: '' });
  store.setRow('settings', 'dietary_restrictions', { key: 'dietary_restrictions', value: '[]' });
  store.setRow('settings', 'calorie_goal', { key: 'calorie_goal', value: '2000' });
  store.setRow('settings', 'max_sodium', { key: 'max_sodium', value: '2300' });
  store.delRow('settings', 'user_name');
  store.delRow('settings', 'email');

  // Reset context
  store.setRow('context', 'time_of_day', { key: 'time_of_day', value: '' });
  store.setRow('context', 'weather', { key: 'weather', value: '' });
  store.setRow('context', 'servings', { key: 'servings', value: '4' });
  store.setRow('context', 'meal_type', { key: 'meal_type', value: '' });
}

/**
 * Load user data from JSON file
 */
export async function loadUserData(email) {
  try {
    currentUser = email;
    console.log(`Loading data for: ${email}`);
    console.log(`User data file path: ${USER_DATA_FILE}`);

    // Always begin from a clean default state for the logged-in user.
    resetUserStateToDefaults();
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(USER_DATA_FILE);
    if (!fileInfo.exists) {
      console.log('No saved data found, using defaults');
      return;
    }
    
    // Read all users
    const content = await FileSystem.readAsStringAsync(USER_DATA_FILE);
    const allUsers = JSON.parse(content);
    
    // Load this user's data
    if (allUsers[email]) {
      const userData = allUsers[email];
      
      // Restore pantry
      if (userData.pantry) {
        userData.pantry.forEach(item => {
          const { id, ...itemData } = item;
          store.setRow('pantry', id || Date.now().toString(), itemData);
        });
      }
      
      // Restore settings
      if (userData.settings) {
        Object.entries(userData.settings).forEach(([key, value]) => {
          store.setRow('settings', key, { key, value: String(value) });
        });
      }
      
      // Restore history
      if (userData.history) {
        userData.history.forEach(h => {
          const id = `${h.recipe_id}_${h.action}_${h.timestamp}`;
          store.setRow('history', id, h);
        });
      }
      
      console.log(`Loaded ${userData.history?.length || 0} history items, ${userData.pantry?.length || 0} pantry items`);
    } else {
      console.log('New user - starting fresh');
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

/**
 * Save current user's data to JSON file
 */
export async function saveUserData() {
  if (!currentUser) {
    console.log('No user logged in, skipping save');
    return;
  }
  
  try {
    // Read existing file
    let allUsers = {};
    const fileInfo = await FileSystem.getInfoAsync(USER_DATA_FILE);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(USER_DATA_FILE);
      allUsers = JSON.parse(content);
    }
    
    // Get current user's data from store
    allUsers[currentUser] = {
      pantry: Object.entries(store.getTable('pantry')).map(([id, item]) => ({
        id,
        ...item
      })),
      settings: Object.fromEntries(
        Object.entries(store.getTable('settings')).map(([key, row]) => [key, row.value])
      ),
      history: Object.values(store.getTable('history')),
      lastUpdated: Date.now()
    };
    
    // Write back
    await FileSystem.writeAsStringAsync(
      USER_DATA_FILE,
      JSON.stringify(allUsers, null, 2)
    );
    
    console.log(`Saved data for ${currentUser}`);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export function getCurrentUser() {
  return currentUser;
}