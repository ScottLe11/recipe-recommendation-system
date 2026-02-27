{/*

Project phases:

1 - Data collection/logical view
- Find a recipe dataset
    - https://www.kaggle.com/datasets/shuyangli94/food-com-recipes-and-user-interactions
    - I found this we can reference it https://www.kaggle.com/code/ngohoantamhuy/food-recommendation-systems 
    - https://archive.ics.uci.edu/dataset/911/recipe+reviews+and+user+feedback+dataset

- Design internal storage system
- Build a logical view with fields to search/rank on
    - Fields: number of ingredients, recipeId, title, ingredients, totalTime, cuisine, difficulty
    - ranking relevant: ingredient match count, user rating, nutrition tags(?)



2 - Build UI
- Allow users to input their ingredients, preferences, etc.
    - Builds user logical view: preferred cuisines, maximum total cook time, liked recipes, disliked recipes, ingredients
- Enable basic filters/sorting


3 - Personal model/refinement
- Develop personalized model and context, improve search/recommendation logic
    - Real time weather API: consider https://openweathermap.org/price (1000 calls per day for free)


*/}

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import IngredientsScreen from './screens/IngredientsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import RecipeScreen from './screens/RecipeScreen';
import * as userProfile from '../src/userProfile';
import PreferencesScreen from './screens/PreferencesScreen';

const mockRecipe = {
    id: "42198",
    name: "better than sex strawberries",
    minutes: 1460,
    difficulty: "Advanced",
    ingredients: [
      "vanilla wafers", 
      "butter", 
      "powdered sugar", 
      "eggs", 
      "whipping cream", 
      "strawberry", 
      "walnuts"
    ],
    steps: [
      "crush vanilla wafers into fine crumbs and line a square 8\" x 8\" pan",
      "mix butter or margarine and sugar",
      "add beaten eggs",
      "spread the mixture over the wafer crumbs",
      "crush strawberries and spread over sugar, egg, and butter mixture",
      "cover strawberries with whipped cream",
      "sprinkle with chopped nuts",
      "chill 24 hours"
    ]
  };


export default function App() {

  return (
     <HomeScreen/>
    // <IngredientsScreen/>
    // <FavoritesScreen/>
    // <PreferencesScreen/>
  );

  // return <RecipeScreen route={{ params: { recipe: mockRecipe } }} />;
}
