// components/FormInput.tsx
import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions, StyleProp, ViewStyle, TextStyle } from 'react-native';
import numeral from 'numeral'; // Import numeral

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  inputStyle?: string | StyleProp<TextStyle>;
  containerStyle?: string | StyleProp<ViewStyle>;
  formatAsCurrency?: boolean; // New prop
  currencySymbol?: string; // Optional: if you want to prefix with a symbol
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
  inputStyle = "",
  containerStyle = "",
  formatAsCurrency = false, // Default to false
  currencySymbol = '',
}) => {

  const handleTextChange = (text: string) => {
    if (formatAsCurrency) {
      // 1. Remove non-digit characters (except decimal point if needed, but for whole numbers, just digits)
      const numericValue = text.replace(/[^0-9]/g, '');
      onChangeText(numericValue); // Pass the raw numeric string back to the parent state
    } else {
      onChangeText(text);
    }
  };

  const displayValue = formatAsCurrency
    ? (value ? numeral(value).format('0,0') : '') // Format only if there's a value
    : value;

  return (
    <View className={containerStyle as string}>
      <Text className="text-sm font-pmedium text-black mb-1.5">
        {label}
        {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View className={`bg-[#F5F5F5] p-3.5 ${label === 'Amount' ? 'rounded-full' : 'rounded-2xl'} shadow-sm flex-row items-center ${inputStyle as string}`}>
        {formatAsCurrency && currencySymbol && value ? (
            <Text className="text-black mr-1">{currencySymbol}</Text>
        ) : null}
        <TextInput
            className="flex-1 text-black" 
            placeholder={placeholder}
            placeholderTextColor="#A0A0A0"
            keyboardType={formatAsCurrency ? 'number-pad' : keyboardType} // Use number-pad for currency
            value={displayValue} // Display the formatted value
            onChangeText={handleTextChange} // Handle raw input
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );
};

export default FormInput;