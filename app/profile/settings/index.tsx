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

  const handlePasswordChange = () => {
    router.push('/profile/settings/password');
  };

  const settingsMenuItems: SettingsMenuItem[] = [
    {
      id: 'change-password',
      label: 'Change Password',
      iconName: 'lock-reset',
      action: handlePasswordChange,
    },
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
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor="#1A1A2E" />
      <View className='p-6'>
        <GoBackToHomeHeader title='Settings' />
      </View>
      {/* Main Content Area */}
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
              <Text className="text-base text-black flex-1">{item.label}</Text>
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