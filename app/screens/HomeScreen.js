import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from '../../src/userProfile';
import { Ionicons } from '@expo/vector-icons';

// 1. Import API
import RecipeAPI from '../../src/api'; 

const HomeScreen = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [userName, setUserName] = useState('Chef');
  const [hasInitialized, setHasInitialized] = useState(false);

  const [greeting, setGreeting] = useState('');
  const [emoji, setEmoji] = useState('');


const updateGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    setGreeting('Good morning');
    setEmoji('☀️');
  } else if (hour < 18) {
    setGreeting('Good afternoon');
    setEmoji('🌤️');
  } else {
    setGreeting('Good evening');
    setEmoji('🌙');
  }
};

useEffect(() => {
  updateGreeting();

  const interval = setInterval(() => {
    updateGreeting();
  }, 60000); // updates every minute

  return () => clearInterval(interval);
}, []);

  // Initial App Load
  useEffect(() => {
    const startup = async () => {
      try {
        const profile = getUserProfile();
        if (profile?.name) setUserName(profile.name);

        await RecipeAPI.initialize();
        
        // Initial delay for welcome screen
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Load initial recommendations
        const results = RecipeAPI.getRecommendations({ limit: 10 });
        setRecipes(results);
        
        setHasInitialized(true); 
      } catch (error) {
        console.error("Startup error:", error);
      }
    };
    startup();
  }, []);

  // Handle Search Logic via searchRecipesByText
  useEffect(() => {
    if (!hasInitialized) return;

    if (searchQuery.trim().length > 0) {
      // Use existing searchRecipesByText logic
      // This ignores pantry/preferences and searches title, tags, and description
      const searchResults = RecipeAPI.searchRecipes(searchQuery);
      setRecipes(searchResults.slice(0, 20)); // Limit to 20 for performance
    } else {
      // Back to personalized recommendations when search is cleared
      const recommendations = RecipeAPI.getRecommendations({ limit: 10 });
      setRecipes(recommendations);
    }
  }, [searchQuery, hasInitialized]);

  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    return 'dinner';
  };

  const renderRecipeCard = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
    >
      {/* Show rank only in recommendation mode */}
      {searchQuery.length === 0 && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
      )}

      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>⏱ {item.minutes}m</Text>
        <Text style={styles.infoText}>📊 {item.difficulty}</Text>
        {/* Only show the match percentage if we are in recommendation mode */}
        {searchQuery.length === 0 && (
          <Text style={styles.infoText}>🎯 {(item.totalScore * 100).toFixed(0)}%</Text>
        )}
      </View>
      
      <Text style={styles.descriptionText}>
        {searchQuery.length > 0 ? "Found via search" : (item.explanation ? item.explanation[0] : "Recommended for you")}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!hasInitialized ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.welcomeTitle}>
            {greeting}, {userName}! {emoji}
          </Text>
          <Text style={styles.loadingSubtitle}>
            Your {getMealType()} recommendations are coming right up...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#b2bec3" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search name, tags, or description..."
                placeholderTextColor="#b2bec3"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="always"
              />
            </View>
          </View>

          <FlatList
            data={recipes} 
            renderItem={renderRecipeCard}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listPadding}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No matches found for "{searchQuery}"</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Existing Styles...
  container: {
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
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
  // NEW SEARCH BAR STYLES
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#E4E4E4',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#636E72',
    fontSize: 16,
  },
  // Original Styles...
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