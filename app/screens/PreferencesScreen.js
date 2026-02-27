import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import profile service
import * as userProfile from '../../src/userProfile';

const PreferencesScreen = () => {
  const [preferences, setPreferences] = useState({
    maxCookingTime: 60,
    skillLevel: 'intermediate'
  });

  // 1. Load existing preferences on mount
  useEffect(() => {
    const profile = userProfile.getUserProfile();
    setPreferences({
      maxCookingTime: profile.preferences.maxCookingTime,
      skillLevel: profile.preferences.skillLevel
    });
  }, []);

  // 2. Function to update and save
  const updatePref = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    // Call bulk update function
    userProfile.updateUserProfile({
      preferences: {
        [key]: value
      }
    });
    console.log(`Updated ${key} to: ${value}`);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Cooking Preferences</Text>
        <Text style={styles.subHeader}>Tailor your recommendations</Text>

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

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color="#636E72" />
          <Text style={styles.infoText}>
            Changes are saved automatically and will update your Home feed.
          </Text>
        </View>
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
  header: {
    paddingTop: 30,
    alignSelf: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  subHeader: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#636E72',
    marginBottom: 30,
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
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#636E72',
    lineHeight: 18,
  }
});

export default PreferencesScreen;