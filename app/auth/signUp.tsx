import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import AuthTextInput from '../../components/AuthTextInput';
import { theme } from '../../utils/theme';
import { SignUpFormData, handleSignUp } from '@/controller/AuthController';
import {
  validateEmail,
  validateName,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validates/auth.validate.config';
import CustomAlert from '../../components/Alert';

// Frontend form interface with confirm password
interface SignUpFormUI {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

function validateForm(form: SignUpFormUI) {
  const newErrors: Partial<Record<keyof SignUpFormUI, string>> = {};

  const emailError = validateEmail(form.email);
  if (emailError) newErrors.email = emailError;

  const firstNameError = validateName(form.firstName, 'First name');
  if (firstNameError) newErrors.firstName = firstNameError;

  const lastNameError = validateName(form.lastName, 'Last name');
  if (lastNameError) newErrors.lastName = lastNameError;

  const passwordError = validatePassword(form.password);
  if (passwordError) newErrors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword);
  if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

  return newErrors;
}

export default function SignUp() {
  const [form, setForm] = useState<SignUpFormUI>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormUI, string>>>({});

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertButtons, setAlertButtons] = useState<Array<{
    text: string;
    onPress: () => void;
    style?: 'primary' | 'secondary' | 'destructive';
  }>>([]);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'primary' | 'secondary' | 'destructive';
    }> = []
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons);
    setAlertVisible(true);
  };

  const handleChange = (key: keyof SignUpFormUI, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = () => {
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Remove confirmPassword for API call - only send what API expects
    const signUpData: Omit<SignUpFormData, 'confirmPassword'> = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      password: form.password,
    };

    handleSignUp(
      signUpData,
      () => {
        showCustomAlert(
          'Success',
          'Account created successfully!',
          'success',
          [
            {
              text: 'OK',
              onPress: () => {
                setAlertVisible(false);
                router.replace('/auth/signIn');
              },
              style: 'primary'
            }
          ]
        );
      },
      () => {
        showCustomAlert(
          'Registration Failed',
          'An error occurred while creating account',
          'error',
          [
            {
              text: 'OK',
              onPress: () => setAlertVisible(false),
              style: 'primary'
            }
          ]
        );
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.subContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthTextInput
            label="Your email"
            value={form.email}
            onChangeText={val => handleChange('email', val)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthTextInput
            label="Your first name"
            value={form.firstName}
            onChangeText={val => handleChange('firstName', val)}
            error={errors.firstName}
            autoCapitalize="words"
          />
          <AuthTextInput
            label="Your last name"
            value={form.lastName}
            onChangeText={val => handleChange('lastName', val)}
            error={errors.lastName}
            autoCapitalize="words"
          />
          <AuthTextInput
            label="Password"
            value={form.password}
            onChangeText={val => handleChange('password', val)}
            isPassword
            error={errors.password}
          />
          <AuthTextInput
            label="Confirm Password"
            value={form.confirmPassword}
            onChangeText={val => handleChange('confirmPassword', val)}
            isPassword
            error={errors.confirmPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => router.replace('/auth/signIn')}>
              Sign In
            </Text>
          </Text>
        </ScrollView>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttons={alertButtons}
        onDismiss={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.violet600,
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-SemiBold',
    color: theme.colors.whiteText,
    textAlign: 'center',
    paddingBottom: 20,
  },
  subContainer: {
    flex: 1,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: theme.colors.violet600,
    padding: 14,
    borderRadius: 8,
    width: 140,
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  switchText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    fontFamily: 'Poppins-Light',
    marginTop: 20,
  },
  link: {
    color: '#6A0DAD',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
