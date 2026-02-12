import { store } from './store.js';

/**
 * Get all pantry items
 */
export function getAllPantryItems() {
  const pantryTable = store.getTable('pantry');
  return Object.entries(pantryTable).map(([id, item]) => ({
    id,
    ...item
  }));
}

/**
 * Add item to pantry
 */
export function addPantryItem(name, quantity = 1, unit = '') {
  const id = name.toLowerCase().replace(/\s+/g, '_');
  
  store.setRow('pantry', id, {
    name,
    quantity: parseFloat(quantity) || 1,
    unit: unit || '',
  });
  
  return id;
}

/**
 * Update pantry item quantity
 */
export function updatePantryItem(id, quantity) {
  const item = store.getRow('pantry', id);
  if (item) {
    store.setRow('pantry', id, {
      ...item,
      quantity: parseFloat(quantity) || 1,
    });
  }
}

/**
 * Remove item from pantry
 */
export function removePantryItem(id) {
  store.delRow('pantry', id);
}

/**
 * Clear all pantry items
 */
export function clearPantry() {
  const pantryIds = Object.keys(store.getTable('pantry'));
  pantryIds.forEach(id => store.delRow('pantry', id));
}

/**
 * Get pantry ingredients as simple string array
 */
export function getPantryIngredientNames() {
  const items = getAllPantryItems();
  return items.map(item => item.name);
}

/**
 * Check if ingredient is in pantry
 */
export function hasIngredient(ingredientName) {
  const items = getAllPantryItems();
  const nameLower = ingredientName.toLowerCase();
  return items.some(item => item.name.toLowerCase().includes(nameLower));
}

/**
 * Bulk add ingredients from array
 */
export function addMultipleIngredients(ingredients) {
  ingredients.forEach(ingredient => {
    if (typeof ingredient === 'string') {
      addPantryItem(ingredient, 1, '');
    } else if (ingredient.name) {
      addPantryItem(ingredient.name, ingredient.quantity || 1, ingredient.unit || '');
    }
  });
}
