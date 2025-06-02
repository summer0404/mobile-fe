import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, Pressable, KeyboardTypeOptions } from 'react-native';
import { theme } from '../utils/theme';
import EyeOnIcon from '../assets/images/eye.svg';
import EyeOffIcon from '../assets/images/eye-off.svg';


type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions; // Updated to use proper type
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; // Added autoCapitalize prop
  autoCorrect?: boolean; // Added autoCorrect prop
  placeholder?: string; // Added placeholder prop
  placeholderTextColor?: string; // Added placeholderTextColor prop
  textContentType?: 
    | 'none'
    | 'URL'
    | 'addressCity'
    | 'addressCityAndState'
    | 'addressState'
    | 'countryName'
    | 'creditCardNumber'
    | 'emailAddress'
    | 'familyName'
    | 'fullStreetAddress'
    | 'givenName'
    | 'jobTitle'
    | 'location'
    | 'middleName'
    | 'name'
    | 'namePrefix'
    | 'nameSuffix'
    | 'nickname'
    | 'organizationName'
    | 'postalCode'
    | 'streetAddressLine1'
    | 'streetAddressLine2'
    | 'sublocality'
    | 'telephoneNumber'
    | 'username'
    | 'password'
    | 'newPassword'
    | 'oneTimeCode'; // Added textContentType prop
};

export default function AuthTextInput({ 
  label, 
  value, 
  onChangeText, 
  isPassword = false, 
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = false,
  placeholder,
  placeholderTextColor = "#999",
  textContentType = 'none'
}: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            !!error && { borderColor: 'red', borderWidth: 1 }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCorrect={autoCorrect}
          textContentType={isPassword ? (textContentType === 'none' ? 'password' : textContentType) : textContentType}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
        {isPassword && (
          <Pressable style={styles.icon} onPress={togglePasswordVisibility}>
            {isPasswordVisible ? (
              <EyeOffIcon width={24} height={24} />
            ) : (
              <EyeOnIcon width={24} height={24} />
            )}
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: theme.colors.greenText,
  },
  input: {
    paddingLeft: 14,
    backgroundColor: '#f5f5ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    color: '#000'
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  error: {
    color: 'red',
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});
