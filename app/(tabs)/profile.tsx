// app/profile.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert, // For logout confirmation
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import InitialsAvatar from '@/components/profile/InitialsAvatar';

// Define a type for profile menu items
interface ProfileMenuItem {
  id: string;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  navigateTo?: string; // Route to navigate to
  action?: () => void; // Action to perform (e.g., logout)
}

const userProfile = {
  firstName: "John",
  lastName: "Doe",
};

const Profile = () => {
  const router = useRouter();

  const profileMenuItems: ProfileMenuItem[] = [
    { id: 'edit', label: 'Edit Profile', iconName: 'account-edit-outline', navigateTo: '/profile/edit' },
    { id: 'setting', label: 'Setting', iconName: 'cog-outline', navigateTo: '/profile/settings' },
    // { id: 'help', label: 'Help', iconName: 'help-circle-outline', navigateTo: '/help' },
    {
      id: 'logout',
      label: 'Logout',
      iconName: 'logout',
      action: () => {
        Alert.alert(
          "Logout",
          "Are you sure you want to logout?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Logout",
              style: "destructive",
              onPress: () => {
                console.log('User logged out');
                // Implement actual logout logic (clear token, reset state)
                router.replace('/auth/signIn'); // Navigate to sign-in screen
              },
            },
          ]
        );
      },
    },
  ];

  const handleMenuItemPress = (item: ProfileMenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.navigateTo) {
      router.push(item.navigateTo);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar />
      <GoBackToHomeHeader title='Profile' />

      {/* User profile picture part */}
      <View  className='items-center justify-center pt-3 z-10'> {/* Added z-10 */}
      {userProfile.firstName && userProfile.lastName ? (
        <InitialsAvatar firstName={userProfile.firstName} lastName={userProfile.lastName} size={80} fontSize={30}/>
      ) : (
        // Fallback if names are not available, e.g., a default icon or placeholder
        <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center">
          {/* You could put an icon here */}
        </View>
      )}
      </View>

      {/* Main Content Area */}
      {/* Pull up by 40px (half of avatar size 80), adjust ScrollView paddingTop accordingly */}
      <View className="flex-1 bg-primary-200 rounded-t-[70] pt-2 -mt-10"> {/* Added -mt-10 */}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 60, // Increased from 20 to 60 (20 original + 40 for the overlap)
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
              <Text className="text-base text-textDark flex-1">{item.label}</Text>
              {item.navigateTo && ( // Show chevron only if it navigates
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