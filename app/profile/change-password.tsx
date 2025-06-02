import React, { useState } from 'react';
import {
    View, Text, Alert, StyleSheet, Pressable,
    ActivityIndicator, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AuthTextInput from '@/components/AuthTextInput';
import { theme } from '@/utils/theme';
import { validateEmail } from '@/utils/validates/auth.validate.config';

// You'll need to add this to your auth service
const forgotPassword = async (email: string) => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_BE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { success: false, error: data.message || 'Failed to send reset email' };
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        return { success: false, error: 'Network error occurred' };
    }
};

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setEmailError('');
    };

    const handleSubmit = async () => {
        // Validate email
        const emailValidationError = validateEmail(email);
        if (emailValidationError) {
            setEmailError(emailValidationError);
            return;
        }

        setIsLoading(true);

        try {
            const response = await forgotPassword(email);
            
            if (response.success) {
                setIsSubmitted(true);
            } else {
                Alert.alert(
                    'Error', 
                    response.error || 'Failed to send reset email. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error', 
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSignIn = () => {
        router.replace('/auth/signIn');
    };

    const handleResendEmail = () => {
        setIsSubmitted(false);
        handleSubmit();
    };

    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={handleBackToSignIn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Check Your Email</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    <View style={styles.successContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail-outline" size={60} color={theme.colors.violet600} />
                        </View>
                        
                        <Text style={styles.successTitle}>Email Sent!</Text>
                        <Text style={styles.successMessage}>
                            We've sent a password reset link to:
                        </Text>
                        <Text style={styles.emailText}>{email}</Text>
                        <Text style={styles.instructionText}>
                            Please check your email and follow the instructions to reset your password.
                        </Text>

                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity style={styles.button} onPress={handleBackToSignIn}>
                                <Text style={styles.buttonText}>Back to Sign In</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton]} 
                                onPress={handleResendEmail}
                            >
                                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                    Resend Email
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.noteText}>
                            Didn't receive the email? Check your spam folder or try resending.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Forgot Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <Text style={styles.description}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Text>

                    <AuthTextInput
                        label="Email"
                        value={email}
                        onChangeText={handleEmailChange}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        error={emailError}
                    />

                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity 
                            style={[styles.button, styles.secondaryButton]} 
                            onPress={() => router.back()}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, isLoading && styles.buttonLoading]} 
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send Reset Link</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
        flex: 1,
        padding: 30,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },
    formContainer: {
        gap: 20,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Poppins-Regular',
        lineHeight: 24,
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
        minWidth: 120,
        flex: 1,
    },
    buttonLoading: {
        backgroundColor: '#cccccc',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.violet600,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
    },
    secondaryButtonText: {
        color: theme.colors.violet600,
    },
    // Success screen styles
    successContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `${theme.colors.violet600}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    successTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        color: theme.colors.violet600,
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'Poppins-Regular',
    },
    emailText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: theme.colors.violet600,
        marginBottom: 15,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
    },
    noteText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Poppins-Regular',
        lineHeight: 18,
    },
});
