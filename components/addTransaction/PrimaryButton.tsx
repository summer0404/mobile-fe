// components/PrimaryButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: string | StyleProp<ViewStyle>;
  textStyle?: string | StyleProp<TextStyle>;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style = '',
  textStyle = ''
}) => {
  return (
    <TouchableOpacity
      className={`py-4 rounded-lg items-center justify-center shadow ${
        disabled ? 'bg-gray-400' : 'bg-primary'
      } ${style as string}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`font-semibold text-base ${disabled ? 'text-gray-600' : 'text-white'} ${textStyle as string}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;