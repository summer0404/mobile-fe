import React, { useState } from 'react';
import {
    View, Text, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Platform
} from 'react-native';
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

// Dummy GoBackToHomeHeader for demonstration; replace with your actual import if needed
const GoBackToHomeHeader = ({ title }: { title: string }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default function ChangePasswordScreen() {
    const [form, setForm] = useState<ChangePasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordFormData, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (key: keyof ChangePasswordFormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        const newErrors = validateForm(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            await handleChangePassword(
                form,
                () => {
                    setIsLoading(false);
                    Alert.alert('Success', 'Change password successfully!', [
                        { text: 'OK', onPress: () => router.replace('/home') },
                    ]);
                },
                () => {
                    setIsLoading(false);
                    setError('An error occurred while changing password');
                    Alert.alert('Change password Failed', 'An error occurred while changing password');
                }
            );
        } catch (e) {
            setIsLoading(false);
            setError('An unexpected error occurred');
        }
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
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.violet600 }}>
            <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} backgroundColor="#1A1A2E" />
            <GoBackToHomeHeader title='Change Password' />

            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 20,
                        paddingBottom: 80,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 24, textAlign: 'center' }}>
                        Update Your Password
                    </Text>

                    {error && (
                        <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                            <Text style={{ color: '#b91c1c', textAlign: 'center' }}>{error}</Text>
                        </View>
                    )}

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

                        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                            {isLoading
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.buttonText}>Change</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        flex: 1,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        paddingTop: 16,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 30,
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        minWidth: 100,
        marginHorizontal: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
