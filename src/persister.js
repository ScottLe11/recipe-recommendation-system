import { createLocalPersister } from 'tinybase/persisters/persister-browser';
import { store } from './store.js';

let persister = null;

/**
 * Setup persistence for TinyBase store using localStorage
 */
export async function setupPersistence() {
  try {
    // Check if localStorage is available (web only)
    if (typeof localStorage === 'undefined') {
      console.log('Persistence not available (localStorage not supported in this environment)');
      return null;
    }
    
    // Create a persister that saves to localStorage
    persister = createLocalPersister(store, 'recipe-app-store');
    
    // Load existing data from localStorage
    await persister.load();
    
    // Start auto-saving changes
    await persister.startAutoSave();
    
    console.log('✓ Persistence setup complete - data will be auto-saved');
    
    return persister;
  } catch (error) {
    console.log('Persistence not available in this environment');
    return null;
  }
}

/**
 * Manually save store to localStorage
 */
export async function saveStore() {
  if (persister) {
    await persister.save();
    console.log('Store saved manually');
  }
}

/**
 * Clear all persisted data
 */
export async function clearPersistedData() {
  if (persister) {
    await persister.destroy();
    console.log('Persisted data cleared');
  }
}
