import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { getMe, refreshToken as refreshTokenApiCall,  } from '@/services/authService'; // Assuming these exist
// Define keys for storing tokens
const ACCESS_TOKEN_KEY = 'accessToken'; // Key for the access token
const REFRESH_TOKEN_KEY = 'refreshToken'; // Key for the refresh token

export default function IndexPage() {
  useEffect(() => {
    const attemptRefreshToken = async (): Promise<boolean> => {
      console.log("Attempting to refresh token...");
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        console.log("No refresh token found.");
        return false;
      }

      try {
        const refreshResponse = await refreshTokenApiCall(storedRefreshToken); // Your API call
        if (refreshResponse.success && refreshResponse.data?.accessToken) {
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.data.accessToken);
          if (refreshResponse.data.refreshToken) { // If your refresh API also returns a new refresh token
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshResponse.data.refreshToken);
          }
          console.log("Token refreshed successfully.");
          return true;
        } else {
          console.log("Token refresh failed:", refreshResponse.message || refreshResponse.error);
          return false;
        }
      } catch (error) {
        console.error("Error during token refresh API call:", error);
        return false;
      }
    };

    const checkStatus = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('onboarded');
        if (onboarded !== 'true') {
          router.replace('/onboarding');
          return;
        }

        const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (!accessToken) {
          // No access token, user needs to log in
          console.log("No access token found. Redirecting to signIn.");
          router.replace('/auth/signIn');
          return;
        }

        // Try to use the access token (e.g., by fetching user details)
        // The getMe() service should automatically use the stored access token
        const userDetailsResponse = await getMe();

        if (userDetailsResponse.success && userDetailsResponse.data) {
          // Access token is valid, user details fetched
          console.log("Access token valid. User details fetched. Redirecting to home.");
          router.replace('/home');
        } else if (userDetailsResponse.error?.toLowerCase().includes('unauthorized') || userDetailsResponse.message?.toLowerCase().includes('unauthorized') || (userDetailsResponse.rawErrorResponse && JSON.parse(userDetailsResponse.rawErrorResponse).statusCode === 401) ) {
          // Access token is likely expired or invalid (e.g., 401 Unauthorized)
          console.log("Access token invalid/expired. Attempting refresh.");
          const refreshedSuccessfully = await attemptRefreshToken();
          if (refreshedSuccessfully) {
            // Token refreshed, try getMe again or just go home
            // For simplicity, let's assume if refresh is successful, we can go home
            // A more robust approach might be to call getMe() again here.
            console.log("Token refreshed. Redirecting to home.");
            router.replace('/home');
          } else {
            // Refresh failed, clear tokens and go to login
            console.log("Token refresh failed. Clearing tokens and redirecting to signIn.");
            await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
            await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            router.replace('/auth/signIn');
          }
        } else {
          // Other error with getMe (not auth-related, e.g. network issue)
          // Or if getMe succeeded but no data (shouldn't happen if success is true)
          console.warn("getMe failed with non-auth error or no data:", userDetailsResponse.message || userDetailsResponse.error);
          // Decide fallback: for now, treat as needing login
          await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
          await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
          router.replace('/auth/signIn');
        }

      } catch (error) {
        console.error("Critical error in checkStatus:", error);
        // Fallback strategy: If any unexpected error occurs,
        // clear tokens and redirect to login.
        try {
          await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
          await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        } catch (removeError) {
          console.error("Failed to remove tokens on critical error:", removeError);
        }
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
