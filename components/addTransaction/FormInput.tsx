// components/FormInput.tsx
import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions, StyleProp, ViewStyle, TextStyle, Platform, TouchableOpacity } from 'react-native';
import numeral from 'numeral';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  inputWrapperStyle?: string | StyleProp<ViewStyle>;
  textInputStyle?: string | StyleProp<TextStyle>;
  containerStyle?: string | StyleProp<ViewStyle>;
  formatAsCurrency?: boolean;
  currencySymbol?: string;
  secureTextEntry?: boolean; // New prop for password hiding
  rightIcon?: React.ComponentProps<typeof MaterialCommunityIcons>['name']; // Optional right icon
  onRightIconPress?: () => void; // Optional handler for right icon press
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  required = false,
  inputWrapperStyle = "",
  textInputStyle = "",
  containerStyle = "",
  formatAsCurrency = false,
  currencySymbol = '',
  secureTextEntry = false, // Default to false
  rightIcon,
  onRightIconPress,
}) => {

  const handleTextChange = (text: string) => {
    if (formatAsCurrency) {
      // Allow only numbers for currency, but keep the raw numeric string for onChangeText
      const numericValue = text.replace(/[^0-9]/g, '');
      onChangeText(numericValue);
    } else {
      onChangeText(text);
    }
  };

  // Display value formatting for currency
  const displayValue = formatAsCurrency
    ? (value && value !== '' ? numeral(value).format('0,0') : '')
    : value;

  // Base TextInput classes
  let baseTextInputClasses = "flex-1 text-textDark";
  if (multiline) {
    // For multiline, allow text to wrap and potentially grow
    baseTextInputClasses += " h-full"; // Ensure it takes available height if multiline
  }
  // If there's a right icon, add some padding to the right of the text input
  if (rightIcon) {
    baseTextInputClasses += " pr-2"; // Adjust padding as needed
  }

  const combinedTextInputStyle = `${baseTextInputClasses} ${textInputStyle as string}`;

  return (
    <View className={containerStyle as string}>
      <Text className="text-sm font-medium text-textDark mb-1.5">
        {label}
        {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View className={`bg-white p-3.5 rounded-lg shadow-sm flex-row items-center ${inputWrapperStyle as string}`}>
        {formatAsCurrency && currencySymbol && value ? (
          <Text className="text-textDark mr-1 mt-0.5">{currencySymbol}</Text>
        ) : null}
        <TextInput
          className={combinedTextInputStyle}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0" // Softer placeholder color
          keyboardType={formatAsCurrency ? 'number-pad' : keyboardType}
          value={displayValue} // Use displayValue for currency formatting
          onChangeText={handleTextChange} // Use handleTextChange for raw value
          multiline={multiline}
          numberOfLines={Platform.OS === 'android' && multiline ? numberOfLines : undefined}
          textAlignVertical={multiline ? "top" : "center"}
          secureTextEntry={secureTextEntry} // Apply secureTextEntry prop
          autoCapitalize="none" // Good practice for passwords and emails
          autoCorrect={false} // Good practice for passwords
        />
        {rightIcon && onRightIconPress && (
          <TouchableOpacity onPress={onRightIconPress} className="p-1">
            <MaterialCommunityIcons name={rightIcon} size={22} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormInput;