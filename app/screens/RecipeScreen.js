import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services
import * as pantryService from '../../src/pantryService';

const RecipeScreen = ({ route }) => {
  const recipe = route?.params?.recipe || {};
  const [pantryItems, setPantryItems] = useState([]);

  useEffect(() => {
    const items = pantryService.getPantryIngredientNames().map(i => i.toLowerCase());
    setPantryItems(items);
  }, []);

  const hasIngredient = (ingredient) => {
    return pantryItems.some(item => ingredient.toLowerCase().includes(item));
  };

  if (!recipe.name) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No recipe data found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.card}>
          
          <Text style={styles.title}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#636E72" />
              <Text style={styles.metaText}>{recipe.minutes} mins</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={16} color="#636E72" />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {recipe.ingredients?.map((ing, index) => (
              <View key={index} style={styles.ingredientRow}>
                <Ionicons 
                  name={hasIngredient(ing) ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={hasIngredient(ing) ? "#27ae60" : "#FF6B6B"} 
                />
                <Text style={[
                  styles.ingredientText, 
                  { color: hasIngredient(ing) ? "#2D3436" : "#b2bec3" }
                ]}>
                  {ing}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Instructions</Text>
          {recipe.steps?.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.simpleStepNumber}>{index + 1}.</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'capitalize'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: '#636E72',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F1F1',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 15,
  },
  ingredientsList: {
    gap: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ingredientText: {
    fontSize: 15,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  simpleStepNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3436',
    width: 25,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#636E72',
    lineHeight: 22,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default RecipeScreen;