import React, { useState } from 'react';
import {
    View, Text, Alert, StyleSheet, Pressable,
    ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AuthTextInput from '@/components/AuthTextInput';
import { theme } from '@/utils/theme';
import {
    ChangePasswordFormData,
    handleChangePassword,
} from '@/controller/AuthController';

import {
    validatePassword,
    validateConfirmPassword,
} from '@/utils/validates/auth.validate.config';

export default function ChangePasswordScreen() {
    const [form, setForm] = useState<ChangePasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFormData, string>>>({});

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (key: keyof ChangePasswordFormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleSubmit = () => {
        const newErrors = validateForm(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        handleChangePassword(
            form,
            () => {
                Alert.alert('Success', 'Change password successfully!', [
                    { text: 'OK', onPress: () => router.replace('/home') },
                ]);
            },
            () => {
                Alert.alert('Change password Failed', 'An error occurred while Change password');
            }
        );
    };

    function validateForm(form: ChangePasswordFormData) {
        const newErrors: Partial<Record<keyof ChangePasswordFormData, string>> = {};

        const currentPasswordError = validatePassword(form.currentPassword);
        if (currentPasswordError) newErrors.currentPassword = currentPasswordError;

        const newPasswordError = validatePassword(form.newPassword);
        if (newPasswordError) newErrors.newPassword = newPasswordError;

        const confirmPasswordError = validateConfirmPassword(form.newPassword, form.confirmPassword);
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

        return newErrors;
    }

    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content': 'light-content'} backgroundColor="#1A1A2E" />
      <GoBackToHomeHeader title='Change Password' />

      <View className="flex-1 bg-primary-200 rounded-t-[70] pt-16">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-lg font-psemibold text-black mb-6 text-center">
            Update Your Password
          </Text>

          {error && (
            <View className="bg-red-100 p-3 rounded-lg mb-4">
              <Text className="text-red-700 text-center">{error}</Text>
            </View>

            <View style={styles.content}>
                <AuthTextInput
                    label="Current Password"
                    value={form.currentPassword}
                    onChangeText={(text) => handleInputChange('currentPassword', text)}
                    isPassword
                    error={errors.currentPassword}
                />
                <AuthTextInput
                    label="New Password"
                    value={form.newPassword}
                    onChangeText={(text) => handleInputChange('newPassword', text)}
                    isPassword
                    error={errors.newPassword}
                />
                <AuthTextInput
                    label="Confirm New Password"
                    value={form.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    isPassword
                    error={errors.confirmPassword}
                />

                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        {isLoading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>Change</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.violet600,
    },
    header: {
        flexDirection: 'row',
        padding: 30,
        paddingBottom: 16,
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.violet600,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    content: {
        height: '100%',
        padding: 30,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        gap: 20,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '5%',
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        minWidth: 100,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
