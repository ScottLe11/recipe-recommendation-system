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
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './screens/HomeScreen';
import IngredientsScreen from './screens/IngredientsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import RecipeScreen from './screens/RecipeScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import LoginScreen from './screens/LoginScreen'; 

import * as userProfile from '../src/userProfile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator(); 

// Home Stack Navigator (so recipe details can be shown)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 26,
          color: '#fff',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ title: 'Recommendations' }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeScreen}
        options={{ title: 'Recipe Details' }}
      />
    </Stack.Navigator>
  );
}

// Favorites Stack Navigator (with recipe detail)
function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 26,
          color: '#fff',
        },
      }}
    >
      <Stack.Screen 
        name="FavoritesMain" 
        component={FavoritesScreen}
        options={{ title: 'My Favorites' }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeScreen}
        options={{ title: 'Recipe Details' }}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Ingredients') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Preferences') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Ingredients" 
        component={IngredientsScreen}
        options={{ 
          title: 'Pantry',
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 26,
            color: '#fff',
          },
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStack}
        options={{ 
          title: 'Favorites',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Preferences" 
        component={PreferencesScreen}
        options={{ 
          title: 'Settings',
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 26,
            color: '#fff',
          },
        }}
      />
    </Tab.Navigator>
  );
}

// Final App Export with Root Navigation
export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* The app starts here */}
        <RootStack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        {/* Once logged in, we move to the tabs */}
        <RootStack.Screen 
          name="MainTabs" 
          component={MainTabs} 
        />
      </RootStack.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}