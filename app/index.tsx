import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';

// Define the key used to store your session identifier in AsyncStorage
const SESSION_IDENTIFIER_KEY = 'sessionIdentifier'; // Replace 'sessionIdentifier' with your actual key

export default function IndexPage() {
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('onboarded');
        // Retrieve the stored session identifier
        const sessionCookie = await AsyncStorage.getItem(SESSION_IDENTIFIER_KEY);

        if (onboarded !== 'true') {
          router.replace('/onboarding');
        } else if (!sessionCookie) {
          // If no session identifier, user is not considered logged in
          router.replace('/auth/signIn');
        } else {
          // If a session identifier exists, user is considered logged in.
          // For better security, you might also want to validate this session
          // with your backend at this point or when accessing protected routes.
          router.replace('/home');
        }
      } catch (error) {
        console.error("Failed to check authentication status:", error);
        // Fallback strategy: If there's an error reading storage,
        // it's safer to assume the user is not logged in.
        router.replace('/auth/signIn');
      }
    };

    checkStatus();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
