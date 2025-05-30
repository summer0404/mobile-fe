import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader'; // Assuming this component can be reused

// Define a type for settings menu items
interface SettingsMenuItem {
  id: string;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  navigateTo?: string; // Route to navigate to
  action?: () => void; // Action to perform
  isToggle?: boolean; // To identify if it's a toggle item
  toggleValue?: boolean; // Current value for the toggle
  onToggleChange?: (value: boolean) => void; // Function to call when toggle changes
}

const SettingsScreen = () => {
  const router = useRouter();
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true); // Example state

  const handlePasswordChange = () => {
    router.push('/profile/settings/password');
    Alert.alert("Change Password", "Navigation to change password screen to be implemented.");
  };

  const handleTogglePushNotifications = (value: boolean) => {
    setPushNotificationsEnabled(value);
    // Here you would typically also save this preference, e.g., to AsyncStorage or backend
    console.log("Push notifications toggled:", value);
    Alert.alert("Notifications", `Push notifications ${value ? 'enabled' : 'disabled'}.`);
  };

  const settingsMenuItems: SettingsMenuItem[] = [
    {
      id: 'change-password',
      label: 'Change Password',
      iconName: 'lock-reset',
      action: handlePasswordChange,
      // navigateTo: '/profile/settings/change-password', // Or navigate directly
    },
    {
      id: 'notifications',
      label: 'Push Notifications',
      iconName: 'bell-outline',
      isToggle: true,
      toggleValue: pushNotificationsEnabled,
      onToggleChange: handleTogglePushNotifications,
    },
    // Add more settings items here
    // { id: 'dark-mode', label: 'Dark Mode', iconName: 'theme-light-dark', isToggle: true, toggleValue: false, onToggleChange: (val) => console.log("Dark mode", val) },
    // { id: 'privacy', label: 'Privacy Policy', iconName: 'shield-account-outline', navigateTo: '/privacy-policy' },
    // { id: 'terms', label: 'Terms of Service', iconName: 'file-document-outline', navigateTo: '/terms-of-service' },
  ];

  const handleMenuItemPress = (item: SettingsMenuItem) => {
    if (item.action && !item.isToggle) { // Don't trigger action for toggle items here, it's handled by the Switch
      item.action();
    } else if (item.navigateTo) {
      router.push(item.navigateTo as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content': 'light-content'} backgroundColor="#1A1A2E" />
      <GoBackToHomeHeader title='Settings' />

      {/* User profile picture part - Can be removed or replaced with a generic settings icon/header */}
      {/* For simplicity, I'm omitting the avatar part from the profile page */}
      {/* <View className='items-center justify-center pt-3 z-10'>
         <View className="w-20 h-20 rounded-full bg-accent/30 justify-center items-center">
            <MaterialCommunityIcons name="cog" size={40} className="text-accent" />
          </View>
      </View> */}

      {/* Main Content Area */}
      {/* Adjust pt-2 if avatar section is removed, or pt-2 -mt-10 if kept and overlapped */}
      <View className="flex-1 bg-primary-200 rounded-t-[70] pt-16">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20, // Adjusted padding if no overlapping avatar
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
        >
          {settingsMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => !item.isToggle && handleMenuItemPress(item)} // Only pressable if not a toggle
              disabled={item.isToggle} // Disable touchable opacity for toggle items to let Switch handle press
              className="flex-row items-center py-4 mb-3 bg-white rounded-xl shadow-sm px-4"
            >
              <View className={`w-10 h-10 bg-accent/20 rounded-lg justify-center items-center mr-4`}>
                <MaterialCommunityIcons name={item.iconName} size={24} className="text-accent" />
              </View>
              <Text className="text-base text-textDark flex-1">{item.label}</Text>
              {item.isToggle && item.onToggleChange ? (
                <Switch
                  trackColor={{ false: "#E0E0E0", true: "#C9A0DC" }} // Example colors
                  thumbColor={item.toggleValue ? "#8A2BE2" : "#f4f3f4"} // Example colors
                  ios_backgroundColor="#E0E0E0"
                  onValueChange={item.onToggleChange}
                  value={item.toggleValue}
                />
              ) : item.navigateTo || item.action ? ( // Show chevron only if it's a navigation or non-toggle action item
                <MaterialCommunityIcons name="chevron-right" size={24} className="text-textMuted" />
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;