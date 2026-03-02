import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator // Added for a loading spinner
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 1. Import API
import RecipeAPI from '../../src/api'; 

const HomeScreen = ({ navigation }) => {
  // 2. Set up state for recipes and loading status
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Refresh recommendations whenever Home tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecommendations();
    }, [])
  );

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      console.log("Loading Recommendations...");
      await RecipeAPI.initialize();
      
      // Get the recommendations (will use current pantry, preferences, and history)
      const results = RecipeAPI.getRecommendations({ limit: 10 });
      setRecipes(results);
      console.log(`Loaded ${results.length} recommendations`);
    } catch (error) {
      console.error("Failed to load recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipeCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card} 
      // Ensure navigation is set up in App.js or ignore if testing just Home
      onPress={() => {
      console.log(`Navigating to: ${item.name}`);
      navigation.navigate('RecipeDetail', { recipe: item });
    }}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>

      {/* 5. Map backend fields to UI fields */}
      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.infoContainer}>
        {/* Use minutes from dataset */}
        <Text style={styles.infoText}>⏱ {item.minutes}m</Text>
        <Text style={styles.infoText}>📊 {item.difficulty}</Text>
        {/* Show the match percentage from engine */}
        <Text style={styles.infoText}>🎯 {(item.totalScore * 100).toFixed(0)}%</Text>
      </View>
      
      {/* Show the first "Explanation" reason as the description */}
      <Text style={styles.descriptionText}>
        {item.explanation ? item.explanation[0] : "Recommended for you"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recommended for You</Text>
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Analyzing recipes...</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listPadding}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#636E72',
  },
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
  listPadding: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankBadge: {
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
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  descriptionText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
    color: '#b2bec3',
    fontStyle: 'italic',
  }
});

export default HomeScreen;