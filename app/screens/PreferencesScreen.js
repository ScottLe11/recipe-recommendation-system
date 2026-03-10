import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import profile service
import * as userProfile from '../../src/userProfile';
import * as preferenceService from '../../src/preferenceService';

const PreferencesScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Chef'); 
  const [preferences, setPreferences] = useState({
    maxCookingTime: 60,
    skillLevel: 'intermediate'
  });
  const [preferredCuisine, setPreferredCuisine] = useState('');
  // State for calorie preference
  const [caloriePref, setCaloriePref] = useState('no pref');
  // State for dietary restrictions (Multiple Selection)
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  // 1. Load existing profile data on mount
  useEffect(() => {
    const profile = userProfile.getUserProfile();
    
    // Set the user's name
    if (profile.name) setUserName(profile.name);
    
    // Set the preferences
    setPreferences({
      maxCookingTime: profile.preferences.maxCookingTime,
      skillLevel: profile.preferences.skillLevel
    });

    // Load dietary restrictions
    if (profile.preferences.dietaryRestrictions) {
      setDietaryRestrictions(profile.preferences.dietaryRestrictions);
    }

    // Load nutrition/calorie goal logic
    if (profile.nutritionGoals) {
      const daily = profile.nutritionGoals.dailyCalories;
      if (daily <= 1500) setCaloriePref('low');
      else if (daily >= 3000) setCaloriePref('high');
      else setCaloriePref('no pref');
    }

    // Load preferred cuisine from settings
    const settings = preferenceService.getUserSettings();
    if (settings.preferred_cuisine) {
      setPreferredCuisine(settings.preferred_cuisine);
    }
  }, []);

  // 2. Function to update and save
  const updatePref = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    userProfile.updateUserProfile({
      preferences: {
        [key]: value
      }
    });
    console.log(`Updated ${key} to: ${value}`);
  };

  // Function to toggle dietary restrictions (Multiple Choice)
  const toggleDietaryRestriction = (restriction) => {
    const lowerRestriction = restriction.toLowerCase();
    let updated = [...dietaryRestrictions];

    if (updated.includes(lowerRestriction)) {
      updated = updated.filter(r => r !== lowerRestriction);
    } else {
      updated.push(lowerRestriction);
    }

    setDietaryRestrictions(updated);
    userProfile.updateUserProfile({
      preferences: {
        dietaryRestrictions: updated
      }
    });
    console.log(`Updated Dietary Restrictions to: ${updated}`);
  };

  // Function to update calorie preference
  const updateCaloriePref = (value) => {
    setCaloriePref(value);
    const calorieMap = { 'low': 1500, 'high': 3000, 'no pref': 2000 };
    
    userProfile.updateUserProfile({
      nutritionGoals: {
        dailyCalories: calorieMap[value]
      }
    });
    console.log(`Updated Calorie Goal to: ${value}`);
  };

  // Function to update cuisine
  const updateCuisine = (cuisine) => {
    const newValue = preferredCuisine === cuisine ? '' : cuisine; // Toggle off if already selected
    setPreferredCuisine(newValue);
    preferenceService.setPreferredCuisine(newValue);
    console.log(`Updated Preferred Cuisine to: ${newValue}`);
  };

  // 3. Handle Logout
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? This will return you to the login screen.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => navigation.replace('Login') 
        }
      ]
    );
  };

  const TimeOption = ({ label, value }) => (
    <TouchableOpacity 
      style={[styles.optionButton, preferences.maxCookingTime === value && styles.selectedButton]}
      onPress={() => updatePref('maxCookingTime', value)}
    >
      <Text style={[styles.optionText, preferences.maxCookingTime === value && styles.selectedOptionText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const DifficultyOption = ({ label, value }) => (
    <TouchableOpacity 
      style={[styles.optionButton, preferences.skillLevel === value && styles.selectedButton]}
      onPress={() => updatePref('skillLevel', value)}
    >
      <Text style={[styles.optionText, preferences.skillLevel === value && styles.selectedOptionText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Calorie Toggle Component
  const CalorieOption = ({ label, value }) => (
    <TouchableOpacity 
      style={[styles.optionButton, caloriePref === value && styles.selectedButton]}
      onPress={() => updateCaloriePref(value)}
    >
      <Text style={[styles.optionText, caloriePref === value && styles.selectedOptionText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CuisineOption = ({ label }) => {
    const isSelected = preferredCuisine.toLowerCase() === label.toLowerCase();
    return (
      <TouchableOpacity 
        style={[styles.cuisineChip, isSelected && styles.selectedCuisineChip]}
        onPress={() => updateCuisine(label.toLowerCase())}
      >
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={16} 
          color={isSelected ? "white" : "#636E72"} 
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.cuisineText, isSelected && styles.selectedCuisineText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Dietary Restriction Chip Component
  const DietaryOption = ({ label }) => {
    const isSelected = dietaryRestrictions.includes(label.toLowerCase());
    return (
      <TouchableOpacity 
        style={[styles.cuisineChip, isSelected && styles.selectedCuisineChip]}
        onPress={() => toggleDietaryRestriction(label)}
      >
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={16} 
          color={isSelected ? "white" : "#636E72"} 
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.cuisineText, isSelected && styles.selectedCuisineText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Personalized Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{userName}'s Preferences</Text>
          <Text style={styles.subHeader}>Tailor your recommendations</Text>
        </View>

        {/* Time Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time-outline" size={20} color="#2D3436" />
            <Text style={styles.sectionTitle}>Max Cooking Time</Text>
          </View>
          <View style={styles.optionsGrid}>
            <TimeOption label="15m" value={15} />
            <TimeOption label="1h" value={60} />
            <TimeOption label="1h+" value={1440} /> 
          </View>
        </View>

        {/* Difficulty Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="bar-chart" size={20} color="#2D3436" />
            <Text style={styles.sectionTitle}>Skill Level</Text>
          </View>
          <View style={styles.optionsGrid}>
            <DifficultyOption label="Easy" value="easy" />
            <DifficultyOption label="Medium" value="intermediate" />
            <DifficultyOption label="Difficult" value="advanced" />
          </View>
        </View>

        {/* Calorie Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame-outline" size={20} color="#2D3436" />
            <Text style={styles.sectionTitle}>Calorie Intake Goal</Text>
          </View>
          <View style={styles.optionsGrid}>
            <CalorieOption label="Low" value="low" />
            <CalorieOption label="No Pref" value="no pref" />
            <CalorieOption label="High" value="high" />
          </View>
        </View>

        {/* Dietary Restrictions Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="leaf-outline" size={20} color="#2D3436" />
            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          </View>
          <View style={styles.cuisineGrid}>
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Sodium'].map((d) => (
              <DietaryOption key={d} label={d} />
            ))}
          </View>
        </View>

        {/* Cuisine Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="restaurant-outline" size={20} color="#2D3436" />
            <Text style={styles.sectionTitle}>Preferred Cuisine</Text>
          </View>
          <View style={styles.cuisineGrid}>
            {['Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 'Indian', 'French'].map((c) => (
              <CuisineOption key={c} label={c} />
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#636E72" />
          <Text style={styles.infoText}>
            Changes are saved automatically and will update your Home feed.
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
  scrollContent: {
    padding: 25,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  subHeader: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    minWidth: '28%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: 'white',
  },
  // Cuisine specific styles
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D1D1',
    backgroundColor: '#FFFFFF',
    marginBottom: 4,
  },
  selectedCuisineChip: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  cuisineText: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '500',
  },
  selectedCuisineText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#636E72',
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PreferencesScreen;