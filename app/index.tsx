import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';

export default function IndexPage() {
  useEffect(() => {
    const checkStatus = async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      const token = await AsyncStorage.getItem('authToken');

      if (onboarded !== 'true') {
        router.replace('/onboarding');
      } else if (!token) {
        router.replace('/auth');
      } else {
        router.replace('/home');
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
