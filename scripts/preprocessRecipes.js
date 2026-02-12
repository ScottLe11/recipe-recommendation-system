// Node.js script to pre-process the CSV into a smaller JSON file
// Run with: node scripts/preprocessRecipes.js

import { readFile, writeFile } from 'fs/promises';
import Papa from 'papaparse';

const MAX_RECIPES = 1000;
const INPUT_FILE = './RAW_recipes.csv/RAW_recipes.csv';
const OUTPUT_FILE = './assets/recipes.json';

console.log('Reading CSV file...');

try {
  const data = await readFile(INPUT_FILE, 'utf8');
  console.log('Parsing CSV...');
  
  Papa.parse(data, {
    header: true,
    preview: MAX_RECIPES,
    skipEmptyLines: true,
    complete: async (results) => {
      console.log(`Parsed ${results.data.length} recipes`);
      
      // Write to JSON file
      try {
        await writeFile(
          OUTPUT_FILE,
          JSON.stringify(results.data, null, 2)
        );
        console.log(`Successfully created ${OUTPUT_FILE} with ${results.data.length} recipes`);
      } catch (err) {
        console.error('Error writing file:', err);
        process.exit(1);
      }
    },
    error: (error) => {
      console.error('Error parsing CSV:', error);
      process.exit(1);
    }
  });
} catch (err) {
  console.error('Error reading file:', err);
  process.exit(1);
}
