import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Services
import * as userProfile from '../../src/userProfile';
import * as pantryService from '../../src/pantryService';
import * as preferenceService from '../../src/preferenceService';

const OnboardingScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('Chef');
  
  // Step 1 State (Pantry)
  const [ingredientName, setIngredientName] = useState('');
  const [pantryList, setPantryList] = useState([]);

  // Step 2 State (Preferences)
  const [prefs, setPrefs] = useState({ 
    maxCookingTime: 60, 
    skillLevel: 'intermediate' 
  });
  
  // State for Cuisine selection
  const [preferredCuisine, setPreferredCuisine] = useState('');
  // State for Dietary selection 
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  // Step 3 State (Nutrition)
  const [nutri, setNutri] = useState({
    calories: 'no pref',
    totalFat: 'no pref',
    sugar: 'no pref',
    sodium: 'no pref',
    protein: 'no pref',
    saturatedFat: 'no pref',
    carbs: 'no pref'
  });

  useEffect(() => {
    const profile = userProfile.getUserProfile();
    if (profile.name) setUserName(profile.name);
    refreshPantry();
  }, []);

  const refreshPantry = () => {
    const items = pantryService.getAllPantryItems();
    setPantryList(items);
  };

  const handleFinish = () => {
    const calorieMap = { 'low': 1500, 'high': 3000, 'no pref': 2000 };
    const sodiumMap = { 'low': 1500, 'no pref': 2300, 'high': 4000 };

    // Save core profile preferences
    userProfile.updateUserProfile({
      preferences: {
        maxCookingTime: prefs.maxCookingTime,
        skillLevel: prefs.skillLevel,
        dietaryRestrictions: dietaryRestrictions
      },
      nutritionGoals: {
        dailyCalories: calorieMap[nutri.calories],
        maxSodium: sodiumMap[nutri.sodium]
      }
    });

    // Save the cuisine preference to the preferenceService settings
    if (preferredCuisine) {
      preferenceService.setPreferredCuisine(preferredCuisine);
    }

    navigation.replace('MainTabs');
  };

  // Generic Toggle Button Component
  const OptionButton = ({ label, value, current, onSelect }) => (
    <TouchableOpacity 
      style={[styles.optionButton, current === value && styles.selectedButton]}
      onPress={() => onSelect(value)}
    >
      <Text style={[styles.optionText, current === value && styles.selectedOptionText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Dietary Component (Multi-select)
  const DietaryOption = ({ label }) => {
    const isSelected = dietaryRestrictions.includes(label.toLowerCase());
    return (
      <TouchableOpacity 
        style={[styles.cuisineChip, isSelected && styles.selectedCuisineChip]}
        onPress={() => {
          const val = label.toLowerCase();
          setDietaryRestrictions(prev => 
            prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
          );
        }}
      >
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={14} 
          color={isSelected ? "white" : "#636E72"} 
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.cuisineText, isSelected && styles.selectedCuisineText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Cuisine Component 
  const CuisineOption = ({ label }) => {
    const isSelected = preferredCuisine.toLowerCase() === label.toLowerCase();
    return (
      <TouchableOpacity 
        style={[styles.cuisineChip, isSelected && styles.selectedCuisineChip]}
        onPress={() => setPreferredCuisine(isSelected ? '' : label.toLowerCase())}
      >
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={14} 
          color={isSelected ? "white" : "#636E72"} 
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.cuisineText, isSelected && styles.selectedCuisineText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Nutrition Row Component (Low | No Pref | High)
  const NutriRow = ({ label, stateKey, icon }) => (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Ionicons name={icon} size={18} color="#2D3436" />
        <Text style={styles.sectionTitle}>{label}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {['low', 'no pref', 'high'].map((mode) => (
          <OptionButton 
            key={mode}
            label={mode === 'no pref' ? 'No Pref' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            value={mode}
            current={nutri[stateKey]}
            onSelect={(v) => setNutri({...nutri, [stateKey]: v})}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.innerContainer}>
          
          {/* Progress Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Welcome, {userName}!</Text>
            <Text style={styles.subHeader}>
              {step === 1 ? "Step 1: Stock your kitchen" : step === 2 ? "Step 2: Your cooking style" : "Step 3: Nutrition Goals"}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
            </View>
          </View>

          {/* STEP 1: PANTRY */}
          {step === 1 && (
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Chicken, Garlic, Rice..."
                  placeholderTextColor="#b2bec3"
                  value={ingredientName}
                  onChangeText={setIngredientName}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => {
                  if (ingredientName.trim()) {
                    pantryService.addPantryItem(ingredientName.trim(), 1, 'item');
                    setIngredientName('');
                    refreshPantry();
                  }
                }}>
                  <Ionicons name="add" size={30} color="white" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={pantryList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.ingredientCard}>
                    <Text style={styles.ingredientText}>{item.name}</Text>
                    <TouchableOpacity onPress={() => { pantryService.removePantryItem(item.id); refreshPantry(); }}>
                      <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.listPadding}
                ListEmptyComponent={<Text style={styles.emptyText}>Add some ingredients to get started!</Text>}
              />
              
              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
                  <Text style={styles.primaryButtonText}>Next: Preferences</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 2 && (
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="time-outline" size={20} color="#2D3436" />
                    <Text style={styles.sectionTitle}>Max Cooking Time</Text>
                  </View>
                  <View style={styles.optionsGrid}>
                    <OptionButton label="15m" value={15} current={prefs.maxCookingTime} onSelect={(v) => setPrefs({...prefs, maxCookingTime: v})} />
                    <OptionButton label="1h" value={60} current={prefs.maxCookingTime} onSelect={(v) => setPrefs({...prefs, maxCookingTime: v})} />
                    <OptionButton label="1h+" value={1440} current={prefs.maxCookingTime} onSelect={(v) => setPrefs({...prefs, maxCookingTime: v})} />
                  </View>
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="bar-chart" size={20} color="#2D3436" />
                    <Text style={styles.sectionTitle}>Skill Level</Text>
                  </View>
                  <View style={styles.optionsGrid}>
                    <OptionButton label="Easy" value="easy" current={prefs.skillLevel} onSelect={(v) => setPrefs({...prefs, skillLevel: v})} />
                    <OptionButton label="Medium" value="intermediate" current={prefs.skillLevel} onSelect={(v) => setPrefs({...prefs, skillLevel: v})} />
                    <OptionButton label="Difficult" value="advanced" current={prefs.skillLevel} onSelect={(v) => setPrefs({...prefs, skillLevel: v})} />
                  </View>
                </View>

                {/* Dietary Preference Section (Multi-select) */}
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

                {/* Cuisine Preference Section (Single-select) */}
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
              </ScrollView>

              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(3)}>
                  <Text style={styles.primaryButtonText}>Next: Nutrition</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                  <Text style={styles.backButtonText}>Back to Pantry</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: NUTRITION */}
          {step === 3 && (
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <NutriRow label="Calories" stateKey="calories" icon="flame-outline" />
                <NutriRow label="Total Fat" stateKey="totalFat" icon="fitness-outline" />
                <NutriRow label="Sugar" stateKey="sugar" icon="ice-cream-outline" />
                <NutriRow label="Sodium" stateKey="sodium" icon="water-outline" />
                <NutriRow label="Protein" stateKey="protein" icon="barbell-outline" />
                <NutriRow label="Saturated Fat" stateKey="saturatedFat" icon="warning-outline" />
                <NutriRow label="Carbohydrates" stateKey="carbs" icon="leaf-outline" />
              </ScrollView>

              <View style={styles.bottomButtonContainer}>
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#2ecc71' }]} onPress={handleFinish}>
                  <Text style={styles.primaryButtonText}>Start Recommending!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                  <Text style={styles.backButtonText}>Back to Preferences</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E4E4E4' },
  innerContainer: { flex: 1, padding: 25 },
  headerContainer: { alignItems: 'center', marginBottom: 20 , paddingTop: 35},
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#2D3436' },
  subHeader: { fontSize: 14, color: '#636E72', marginTop: 5, marginBottom: 15 },
  progressBar: { width: '100%', height: 6, backgroundColor: '#D1D1D1', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FF6B6B' },
  
  // Pantry
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 15, height: 50, elevation: 2 },
  addButton: { backgroundColor: '#FF6B6B', width: 50, height: 50, borderRadius: 10, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
  ingredientCard: { backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10 },
  ingredientText: { fontSize: 16, fontWeight: '500', color: '#2D3436', textTransform: 'capitalize' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#b2bec3', fontStyle: 'italic' },
  listPadding: { paddingBottom: 20 },

  // Sections
  scrollContent: { paddingBottom: 20 },
  section: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#2D3436' },
  optionsGrid: { flexDirection: 'row', gap: 8 },
  optionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F1F1F1', backgroundColor: '#FAFAFA', alignItems: 'center' },
  selectedButton: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  optionText: { fontSize: 12, color: '#636E72', fontWeight: '600' },
  selectedOptionText: { color: 'white' },

  // Cuisine styles 
  cuisineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  selectedCuisineChip: { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  cuisineText: { fontSize: 12, color: '#636E72', fontWeight: '500' },
  selectedCuisineText: { color: 'white', fontWeight: 'bold' },

  // Bottom Navigation
  bottomButtonContainer: { 
    paddingTop: 10, 
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#E4E4E4' 
  },
  primaryButton: { 
    backgroundColor: '#FF6B6B', 
    flexDirection: 'row', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10 
  },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  backButton: { marginTop: 15, alignItems: 'center', paddingVertical: 5 },
  backButtonText: { color: '#636E72', fontSize: 14, fontWeight: '600' }
});

export default OnboardingScreen;