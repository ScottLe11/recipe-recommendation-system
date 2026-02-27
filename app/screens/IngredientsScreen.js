import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import pantry service
import * as pantryService from '../../src/pantryService';

const IngredientsScreen = () => {
  const [ingredientName, setIngredientName] = useState('');
  const [pantryList, setPantryList] = useState([]);

  // 1. Load the pantry items when the screen opens
  useEffect(() => {
    refreshPantry();
  }, []);

  const refreshPantry = () => {
    const items = pantryService.getAllPantryItems();
    setPantryList(items);
    console.log('Current Pantry State:', items);
  };

  // 2. Add item to the backend
  const handleAddIngredient = () => {
    if (ingredientName.trim().length > 0) {
      // Logic: name, quantity (default 1), unit (default 'item')
      pantryService.addPantryItem(ingredientName.trim(), 1, 'item');
      setIngredientName(''); // Clear input
      refreshPantry(); // Update list
    }
  };

  // 3. Remove item from the backend
  const handleRemoveIngredient = (id) => {
    pantryService.removePantryItem(id);
    refreshPantry();
  };

  const renderIngredient = ({ item }) => (
    <View style={styles.ingredientCard}>
      <Text style={styles.ingredientText}>{item.name}</Text>
      <TouchableOpacity onPress={() => handleRemoveIngredient(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.header}>My Pantry</Text>
        <Text style={styles.subHeader}>Add ingredients you have on hand</Text>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chicken, Garlic, Rice..."
            value={ingredientName}
            onChangeText={setIngredientName}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* List of Ingredients */}
        <FlatList
          data={pantryList}
          keyExtractor={(item) => item.id}
          renderItem={renderIngredient}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your pantry is empty. Add something!</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E4E4',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
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
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    width: 50,
    height: 50,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
    textTransform: 'capitalize',
  },
  listPadding: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#b2bec3',
    fontStyle: 'italic',
  }
});

export default IngredientsScreen;