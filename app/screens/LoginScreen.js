import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { updateUserProfile } from '../../src/userProfile';
import { loadUserData } from '../../src/store';

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    if (name.trim() === '' || email.trim() === '') {
      Alert.alert("Error", "Please enter a name and email.");
      return;
    }

    const formattedEmail = email.toLowerCase().trim();
    const formattedName = name.trim();
    const USER_DATA_FILE = `${FileSystem.documentDirectory}users.json`;

    try {
      // Check if the user already exists in the JSON file
      const fileInfo = await FileSystem.getInfoAsync(USER_DATA_FILE);
      let isReturningUser = false;

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(USER_DATA_FILE);
        const allUsers = JSON.parse(content);
        
        const existingUser = allUsers[formattedEmail];
        console.log("All current users:")
        Object.entries(allUsers).forEach(([key, value]) => {
          console.log(key, value);
          console.log('\n');
        });

        if (existingUser) {
          // Check if the name provided matches the name stored in settings
          const storedName = existingUser.settings?.user_name || existingUser.settings?.name;

          if (storedName && storedName.toLowerCase() !== formattedName.toLowerCase()) {
            Alert.alert(
              "Identity Mismatch", 
              "This email is registered to a different name. Please check your details."
            );
            return;
          }
          // If name matches, we skip onboarding and go to MainTabs
          isReturningUser = true;
        }
      }

      // This updates the 'user_name' field added earlier
      await loadUserData(formattedEmail);

      updateUserProfile({
        name: formattedName,
        email: formattedEmail,
      });

      // Navigation Logic
      if (isReturningUser) {
        console.log("Welcome back! Skipping onboarding.");
        navigation.replace('MainTabs');
      } else {
        console.log("New user detected. Moving to onboarding.");
        navigation.replace('Onboarding');
      }

    } catch (error) {
      console.error("Login check error:", error);
      Alert.alert("Error", "Something went wrong checking your account.");
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginCard}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Enter your details to get personalized recommendations</Text>

        <TextInput
          style={styles.input}
          placeholder="What's your name?"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#b2bec3"
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#b2bec3"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Start Cooking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    padding: 30,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#2D3436',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;