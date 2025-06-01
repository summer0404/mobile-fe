// app/profile.tsx
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import InitialsAvatar from '@/components/profile/InitialsAvatar';
import { getMe, UserProfile as ApiUserProfile, logOut } from '@/services/authService'; // Make sure logOut is imported

// Define a type for profile menu items
interface ProfileMenuItem {
  id: string;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  navigateTo?: string; // Route to navigate to
  action?: () => void; // Action to perform (e.g., logout)
}


const Profile = () => {
  const router = useRouter();
  const [userFirstName, setUserFirstName] = useState<string | undefined>(undefined);
  const [userLastName, setUserLastName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      console.log("[ProfileScreen] Calling getMe...");
      const response = await getMe();
      console.log("[ProfileScreen] getMe response:", JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        setUserFirstName(response.data.firstName);
        setUserLastName(response.data.lastName);
      } else {
        setError(response.message || "Failed to load profile data.");
        // Alert.alert("Error", response.message || "Could not load your profile. Please try again later.");
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    console.log('Attempting to log out directly...');
    const response = await logOut(); // Call the imported logOut function
    if (response.success) {
      console.log('Logout successful:', response.message);
      router.replace('/auth/signIn'); // Navigate to sign-in screen
    } else {
      console.error('Logout failed:', response.message, response.error);
      Alert.alert("Logout Failed", response.message || response.error || "Could not log out. Please try again.");
    }
  };

  const profileMenuItems: ProfileMenuItem[] = [
    { id: 'edit', label: 'Edit Profile', iconName: 'account-edit-outline', navigateTo: '/profile/edit' },
    { id: 'setting', label: 'Setting', iconName: 'cog-outline', navigateTo: '/profile/settings' },
    {
      id: 'logout',
      label: 'Logout',
      iconName: 'logout',
      action: handleLogout, 
    },
  ];

  const handleMenuItemPress = (item: ProfileMenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.navigateTo) {
      router.push(item.navigateTo as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar />
      <GoBackToHomeHeader title='Profile' />

      {/* User profile picture part */}
      <View className='items-center justify-center pt-3 z-10'>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFFFFF" className="my-3" />
        ) : error ? (
          <View className="items-center justify-center p-4 rounded-xl bg-red-100 w-20 h-20">
            <MaterialCommunityIcons name="alert-circle-outline" size={32} className="text-red-500" />
          </View>
        ) : userFirstName && userLastName ? (
          <InitialsAvatar firstName={userFirstName} lastName={userLastName} size={80} fontSize={30} />
        ) : (
          // Fallback if names are not available after loading (e.g. API returned empty names)
          <View className="w-20 h-20 rounded-full bg-gray-300 justify-center items-center">
            <MaterialCommunityIcons name="account-question-outline" size={40} className="text-gray-500" />
          </View>
        )}
      </View>

      {/* Main Content Area */}
      <View className="flex-1 bg-primary-200 rounded-t-[70] pt-2 -mt-10">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 80
          }}
          showsVerticalScrollIndicator={false}
        >
          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleMenuItemPress(item)}
              className="flex-row items-center py-4 mb-2 bg-white rounded-xl shadow-sm px-4"
            >
              <View className={`w-10 h-10 bg-accent/20 rounded-lg justify-center items-center mr-4`}>
                <MaterialCommunityIcons name={item.iconName} size={24} className="text-accent" />
              </View>
              <Text className="text-base text-black flex-1">{item.label}</Text>
              {item.navigateTo && (
                <MaterialCommunityIcons name="chevron-right" size={24} className="text-textMuted" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Profile;