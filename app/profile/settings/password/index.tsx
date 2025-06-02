import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable,
    ActivityIndicator, TouchableOpacity, SafeAreaView, StatusBar
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
    validateEmail,
} from '@/utils/validates/auth.validate.config';
import CustomAlert, { AlertButton } from '@/components/Alert';

// Update the form data interface to include email
interface ExtendedChangePasswordFormData extends ChangePasswordFormData {
    email: string;
}

export default function ChangePasswordScreen() {
    const [form, setForm] = useState<ExtendedChangePasswordFormData>({
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ExtendedChangePasswordFormData, string>>>({});
    const [isLoading, setIsLoading] = useState(false);

    // CustomAlert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

    const showCustomAlert = (
        title: string,
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'info',
        buttons: AlertButton[] = []
    ) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertButtons(buttons);
        setAlertVisible(true);
    };

    const handleInputChange = (key: keyof ExtendedChangePasswordFormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleSubmit = () => {
        const newErrors = validateForm(form);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        // Extract only the required fields for the change password function
        const changePasswordData: ChangePasswordFormData = {
            email: form.email,
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
            confirmPassword: form.confirmPassword,
        };

        handleChangePassword(
            changePasswordData,
            () => {
                setIsLoading(false);
                showCustomAlert(
                    'Success',
                    'Password changed successfully!',
                    'success',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setAlertVisible(false);
                                router.replace('/home');
                            },
                            style: 'primary'
                        }
                    ]
                );
            },
            () => {
                setIsLoading(false);
                showCustomAlert(
                    'Change Password Failed',
                    'An error occurred while changing password. Please check your current password and try again.',
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

    function validateForm(form: ExtendedChangePasswordFormData) {
        const newErrors: Partial<Record<keyof ExtendedChangePasswordFormData, string>> = {};

        // Validate email
        const emailError = validateEmail(form.email);
        if (emailError) newErrors.email = emailError;

        const currentPasswordError = validatePassword(form.currentPassword);
        if (currentPasswordError) newErrors.currentPassword = currentPasswordError;

        const newPasswordError = validatePassword(form.newPassword);
        if (newPasswordError) newErrors.newPassword = newPasswordError;

        const confirmPasswordError = validateConfirmPassword(form.newPassword, form.confirmPassword);
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

        return newErrors;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Change Password</Text>
                <Ionicons name="notifications" size={24} color="#fff" />
            </View>

            <View style={styles.content}>
                <AuthTextInput
                    label="Email"
                    value={form.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />
                <AuthTextInput
                    label="Current password"
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

                    <TouchableOpacity 
                        style={[styles.button, isLoading && styles.buttonLoading]} 
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>Change</Text>}
                    </TouchableOpacity>
                </View>
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
        </SafeAreaView>
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
        gap: 20, // Changed from '5%' to numeric value
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        minWidth: 100,
    },
    buttonLoading: {
        backgroundColor: '#cccccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
