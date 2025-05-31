import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type AlertButton = { // Add export here
  text: string;
  onPress: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
};

type CustomAlertProps = {
  isVisible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  buttons: AlertButton[];
  onDismiss: () => void; // Called when modal is requested to be closed (e.g., back button on Android)
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  isVisible,
  title,
  message,
  type = 'info',
  buttons,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle-outline', color: '#4CAF50' }; // Green
      case 'error':
        return { name: 'alert-circle-outline', color: '#F44336' }; // Red
      case 'warning':
        return { name: 'alert-outline', color: '#FF9800' }; // Orange
      case 'info':
      default:
        return { name: 'information-outline', color: '#2196F3' }; // Blue (adjust to app's accent if needed)
    }
  };

  const icon = getIcon();

  const getButtonStyle = (style?: 'primary' | 'secondary' | 'destructive') => {
    switch (style) {
      case 'primary':
        return 'bg-primary px-4 py-2 rounded-lg';
      case 'destructive':
        return 'bg-red-500 px-4 py-2 rounded-lg';
      case 'secondary':
      default:
        return 'bg-gray-200 px-4 py-2 rounded-lg';
    }
  };

  const getButtonTextStyle = (style?: 'primary' | 'secondary' | 'destructive') => {
    switch (style) {
      case 'primary':
        return 'text-white font-psemibold text-center';
      case 'destructive':
        return 'text-white font-psemibold text-center';
      case 'secondary':
      default:
        return 'text-black font-psemibold text-center';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="w-full max-w-md bg-primary-200 rounded-xl p-6 shadow-xl">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name={icon.name as any} size={28} color={icon.color} />
            <Text className="text-xl font-psemibold text-black ml-3">{title}</Text>
          </View>

          <Text className="text-base text-textMuted mb-6 leading-relaxed">{message}</Text>

          <View className={`flex-row ${buttons.length > 1 ? 'justify-end' : 'justify-center'} space-x-3`}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  button.onPress();
                  // Optionally auto-dismiss, or let the onPress handler do it.
                  // onDismiss(); 
                }}
                className={`${getButtonStyle(button.style)} ${buttons.length === 1 ? 'flex-1' : ''}`}
              >
                <Text className={getButtonTextStyle(button.style)}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;