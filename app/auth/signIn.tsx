import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthTextInput from '../../components/AuthTextInput';
import { useState } from 'react';
import { router, useRouter } from 'expo-router';
import React from 'react';
import { theme } from '../../utils/theme';
import { logIn, LoginCredentials } from '@/services/authService';
import CustomAlert, { AlertButton } from '@/components/Alert';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        message: string;
        buttons: AlertButton[];
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        title: '',
        message: '',
        buttons: [],
        type: 'info',
    });
    
    const router = useRouter();
    
  const handleSignIn = async () => {
    // Client-side validation
    if (!email.trim()) {
      setAlertConfig({
        title: "Validation Error",
        message: "Please enter your email address.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false), style: 'primary' }],
        type: 'warning',
      });
      setAlertVisible(true);
      return;
    }

    if (!password) {
      setAlertConfig({
        title: "Validation Error",
        message: "Please enter your password.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false), style: 'primary' }],
        type: 'warning',
      });
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);

    const credentials: LoginCredentials = { email, password };
    const response = await logIn(credentials);

    setIsLoading(false);
    if (response.success) {
      console.log('Login successful:', response.message);
      router.replace('/home'); 
    } else {
      // Show user-friendly error message
      setAlertConfig({
        title: "Login Failed",
        message: "Your email or password is not correct. Please check your credentials and try again.",
        buttons: [{ text: "OK", onPress: () => setAlertVisible(false), style: 'primary' }],
        type: 'error',
      });
      setAlertVisible(true);
    }
  };

  const handleForgotPassword = () => {
    router.push('/profile/change-password');
  };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome</Text>

            <View style={styles.subContainer}>
                <AuthTextInput 
                    label="Email" 
                    value={email} 
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                />
                <AuthTextInput 
                    label="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    isPassword 
                    textContentType="password"
                />

                <TouchableOpacity
                    onPress={handleSignIn}
                    style={[styles.button, isLoading && styles.buttonLoading]}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* <Text style={styles.fingerprintText}>Use <Text style={{ color: 'orange' }}>Fingerprint</Text> To Access</Text> */}

                <Text style={styles.switchText}>
                    Don't have an account? <Text style={styles.link} onPress={() => router.replace('/auth/signUp')}>Sign Up</Text>
                </Text>
            </View>
            <CustomAlert
                isVisible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                type={alertConfig.type}
                onDismiss={() => setAlertVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        backgroundColor: theme.colors.violet600,
        paddingTop: 50,
    },
    subContainer: {
        fontSize: 15,
        fontFamily: 'Poppins-Medium',
        position: 'absolute',
        paddingLeft: 28,
        paddingRight: 28,
        margin: 'auto',
        paddingTop: 90,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        width: '100%',
        height: '87%',
        bottom: 0,
        backgroundColor: theme.colors.violet100,
    },
    title: {
        fontSize: 30,
        fontFamily: 'Poppins-SemiBold',
        color: theme.colors.whiteText,
        marginBottom: 20,
        alignSelf: 'center',
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 14,
        borderRadius: 8,
        width: 140,
        alignItems: 'center',
        marginTop: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    buttonLoading: {
        backgroundColor: '#cccccc',
    },
    secondaryButton: {
        backgroundColor: '#a370f7',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#fff',
    },
    fingerprintText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },
    switchText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
        fontSize: 13,
        fontFamily: 'Poppins-Light',
    },
    link: {
        color: '#6A0DAD',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 20,
    },
});

