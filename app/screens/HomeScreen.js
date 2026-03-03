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
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from '../../src/userProfile';

// 1. Import API
import RecipeAPI from '../../src/api'; 

const HomeScreen = ({ navigation }) => {
  // 2. Set up state for recipes and loading status
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Chef');
  // Track if the first-time welcome splash has already happened
  const [hasInitialized, setHasInitialized] = useState(false);

  // 3. Initial App Load (Runs ONLY once when the app is first opened)
  useEffect(() => {
    const startup = async () => {
      try {
        console.log("🚀 Initial App Startup...");
        const profile = getUserProfile();
        if (profile?.name) setUserName(profile.name);

        await RecipeAPI.initialize();
        
        // The 2-second delay only happens here on the very first load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const results = RecipeAPI.getRecommendations({ limit: 10 });
        setRecipes(results);
        
        setHasInitialized(true); 
        setIsLoading(false);
      } catch (error) {
        console.error("Startup error:", error);
        setIsLoading(false);
      }
    };

    startup();
  }, []); // Empty array ensures this only runs once

  // 4. Refresh recommendations (silent) whenever Home tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Only refresh data if the initial splash is already done
      if (hasInitialized) {
        console.log("🔄 Background refresh (no splash screen)");
        const results = RecipeAPI.getRecommendations({ limit: 10 });
        setRecipes(results);
      }
    }, [hasInitialized])
  );

  // Helper to determine meal type based on current time
  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    return 'dinner';
  };

  const renderRecipeCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        console.log(`Navigating to: ${item.name}`);
        navigation.navigate('RecipeDetail', { recipe: item });
      }}
    >
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>

      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>⏱ {item.minutes}m</Text>
        <Text style={styles.infoText}>📊 {item.difficulty}</Text>
        <Text style={styles.infoText}>🎯 {(item.totalScore * 100).toFixed(0)}%</Text>
      </View>
      
      <Text style={styles.descriptionText}>
        {item.explanation ? item.explanation[0] : "Recommended for you"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Show the Welcome Screen only if NOT initialized */}
      {!hasInitialized ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.welcomeTitle}>Welcome, {userName}!</Text>
          <Text style={styles.loadingSubtitle}>
            Your {getMealType()} recommendations are coming right up...
          </Text>
        </View>
      ) : (
        <>
          <Text></Text>
          <FlatList
            data={recipes}
            renderItem={renderRecipeCard}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listPadding}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 28,             
    fontWeight: 'bold',
    color: '#FF6B6B',         
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',      
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