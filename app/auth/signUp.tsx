import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AuthTextInput from '../../components/AuthTextInput';
import { theme } from '../../utils/theme';
import FacebookIcon from '../../assets/images/facebook.svg';
import GoogleIcon from '../../assets/images/google.svg';
import { SignUpFormData, handleSignUp } from '@/controller/AuthController';
import {
  validateEmail,
  validateName,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validates/auth.validate.config';

function validateForm(form: SignUpFormData) {
  const newErrors: Partial<Record<keyof SignUpFormData, string>> = {};

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

export default function SignIn() {
  const [form, setForm] = useState<SignUpFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});

  const handleChange = (key: keyof SignUpFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = () => {
    const newErrors = validateForm(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    handleSignUp(
      form,
      () => {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/home') },
        ]);
      },
      () => {
        Alert.alert('Registration Failed', 'An error occurred while creating account');
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.subContainer}>
        <AuthTextInput
          label="Your email"
          value={form.email}
          onChangeText={val => handleChange('email', val)}
          error={errors.email}
        />
        <AuthTextInput
          label="Your first name"
          value={form.firstName}
          onChangeText={val => handleChange('firstName', val)}
          error={errors.firstName}
        />
        <AuthTextInput
          label="Your last name"
          value={form.lastName}
          onChangeText={val => handleChange('lastName', val)}
          error={errors.lastName}
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

        <Text style={styles.orText}>or sign up with</Text>

        <View style={styles.iconRow}>
          <FacebookIcon width={30} height={30} />
          <GoogleIcon width={30} height={30} />
        </View>

        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.replace('/auth/signIn')}>
            Sign In
          </Text>
        </Text>
      </View>
    </View>
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
  },
  subContainer: {
    position: 'absolute',
    width: '100%',
    height: '87%',
    bottom: 0,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  button: {
    backgroundColor: theme.colors.violet600,
    padding: 14,
    borderRadius: 8,
    width: 140,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#fff',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#555',
    fontSize: 13,
    fontFamily: 'Poppins-Light',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  switchText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    fontFamily: 'Poppins-Light',
  },
  link: {
    color: '#6A0DAD',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
