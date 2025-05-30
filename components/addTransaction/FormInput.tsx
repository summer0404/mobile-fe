// components/FormInput.tsx
import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import numeral from 'numeral';

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

  // Base TextInput classes
  let baseTextInputClasses = "flex-1 text-textDark";
  if (multiline) {
    baseTextInputClasses += " h-full";
  }
  const combinedTextInputStyle = `${baseTextInputClasses} ${textInputStyle as string}`;

  return (
    <View className={containerStyle as string}>
      <Text className="text-sm font-medium text-textDark mb-1.5">
        {label}
        {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View className={`bg-white p-3.5 rounded-lg shadow-sm flex-row items-start ${inputWrapperStyle as string}`}>
        {formatAsCurrency && currencySymbol && value ? (
          <Text className="text-textDark mr-1 mt-0.5">{currencySymbol}</Text>
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
        />
      </View>
    </View>
  );
};

export default FormInput;