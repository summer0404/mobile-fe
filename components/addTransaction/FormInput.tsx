// components/FormInput.tsx
import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions, StyleProp, ViewStyle, TextStyle, Platform, TouchableOpacity } from 'react-native';
import numeral from 'numeral';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  secureTextEntry?: boolean;
  rightIcon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onRightIconPress?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // Added autoCapitalize prop
  autoCorrect?: boolean; // Added autoCorrect prop
  autoComplete?: 
    | 'additional-name'
    | 'address-line1'
    | 'address-line2'
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'country'
    | 'current-password'
    | 'email'
    | 'family-name'
    | 'given-name'
    | 'honorific-prefix'
    | 'honorific-suffix'
    | 'name'
    | 'new-password'
    | 'off'
    | 'one-time-code'
    | 'organization'
    | 'organization-title'
    | 'postal-code'
    | 'street-address'
    | 'tel'
    | 'username'; // Added autoComplete prop
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
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  autoCapitalize = 'sentences', // Default to sentences
  autoCorrect = true, // Default to true (changed from false)
  autoComplete = 'off', // Default to off
}) => {

  const handleTextChange = (text: string) => {
    if (formatAsCurrency) {
      const numericValue = text.replace(/[^0-9]/g, '');
      onChangeText(numericValue);
    } else {
      onChangeText(text);
    }
  };

  const displayValue = formatAsCurrency
    ? (value && value !== '' ? numeral(value).format('0,0') : '')
    : value;

  let baseTextInputClasses = "flex-1 text-black";
  if (multiline) {
    baseTextInputClasses += " h-full";
  }
  if (rightIcon) {
    baseTextInputClasses += " pr-2";
  }

  const combinedTextInputStyle = `${baseTextInputClasses} ${textInputStyle as string}`;

  // Override autoCorrect and autoCapitalize for password fields
  const finalAutoCorrect = secureTextEntry ? false : autoCorrect;
  const finalAutoCapitalize = secureTextEntry ? 'none' : autoCapitalize;

  return (
    <View className={containerStyle as string}>
      <Text className="text-sm font-pmedium text-black mb-1.5">
        {label}
        {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View className={`bg-white p-3.5 rounded-lg shadow-sm flex-row items-center ${inputWrapperStyle as string}`}>
        {formatAsCurrency && currencySymbol && value ? (
          <Text className="text-black mr-1 mt-0.5">{currencySymbol}</Text>
        ) : null}
        <TextInput
          className={combinedTextInputStyle}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          keyboardType={formatAsCurrency ? 'number-pad' : keyboardType}
          value={displayValue}
          onChangeText={handleTextChange}
          multiline={multiline}
          numberOfLines={Platform.OS === 'android' && multiline ? numberOfLines : undefined}
          textAlignVertical={multiline ? "top" : "center"}
          secureTextEntry={secureTextEntry}
          autoCapitalize={finalAutoCapitalize} // Use processed value
          autoCorrect={finalAutoCorrect} // Use processed value
          autoComplete={autoComplete} // Add autoComplete prop
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