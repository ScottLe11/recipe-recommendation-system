import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import API and specific services
import RecipeAPI from '../../src/api'; 
import * as recipeService from '../../src/recipeService';
import { getUserProfile } from '../../src/userProfile'; // Using named export

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);
  const [userGoals, setUserGoals] = useState({ calorieGoal: 2000 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("Syncing Profile and Favorites...");
        await RecipeAPI.initialize();
        
        // 1. Get the profile 
        const profile = getUserProfile();
        
        // 2. Extract the liked IDs from the nested structure 
        const likedIds = profile.history.likedRecipes || [];
        setUserGoals({ calorieGoal: profile.nutritionGoals.dailyCalories });

        // 3. Filter the database
        const allRecipes = recipeService.getAllRecipes();
        const favoriteList = allRecipes.filter(recipe => likedIds.includes(recipe.id));
        
        setFavorites(favoriteList);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Helper to calculate total calories of all favorites
  const totalCalories = favorites.reduce((sum, r) => sum + (r.calories || 0), 0);

  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.heartBadge}>
        <Ionicons name="heart" size={14} color="white" />
      </View>

      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>⏱ {item.minutes}m</Text>
        <Text style={styles.infoText}>📊 {item.difficulty}</Text>
        <Text style={styles.infoText}>🔥 {item.calories || 0} kcal</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Favorites</Text>

      {/* 4. Nutrition Goal Summary Section */}
      {!isLoading && favorites.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Nutrition Insight</Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Favorites Cal</Text>
              <Text style={styles.summaryValue}>{totalCalories} kcal</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.summaryLabel}>Daily Goal</Text>
              <Text style={styles.summaryValue}>{userGoals.calorieGoal} kcal</Text>
            </View>
          </View>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderRecipeCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={50} color="#b2bec3" />
              <Text style={styles.emptyText}>No favorite recipes yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
  header: {
    paddingTop: 30,
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#2D3436',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
  },
  summaryTitle: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#b2bec3',
    fontSize: 10,
  },
  summaryValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#636E72',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    position: 'relative',
    elevation: 3,
  },
  heartBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    color: '#2D3436',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPadding: {
    paddingBottom: 20,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#b2bec3',
    fontStyle: 'italic',
  }
});

export default FavoritesScreen;