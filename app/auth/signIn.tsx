import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthTextInput from '../../components/AuthTextInput';
import { useState } from 'react';
import { router, useRouter } from 'expo-router';
import React from 'react';
import { theme } from '../../utils/theme';
import FacebookIcon from '../../assets/images/facebook.svg'
import GoogleIcon from '../../assets/images/google.svg'
import { logIn, LoginCredentials } from '@/services/authService';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    
  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const credentials: LoginCredentials = { email, password };
    const response = await logIn(credentials);

    setIsLoading(false);
    if (response.success) {
      console.log('Login successful:', response.message);
      router.replace('/home'); 
    } else {
      setError(response.message || response.error || 'Login failed. Please check your credentials.');
    }
  };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome</Text>

            <View style={styles.subContainer}>
                <AuthTextInput label="Email" value={email} onChangeText={setEmail} />
                <AuthTextInput label="Password" value={password} onChangeText={setPassword} isPassword />

                <TouchableOpacity
                    onPress={handleSignIn}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>

                <Text style={styles.fingerprintText}>Use <Text style={{ color: 'orange' }}>Fingerprint</Text> To Access</Text>

                <Text style={styles.orText}>or sign in with</Text>
                <View style={styles.iconRow}>
                    <FacebookIcon width={30} height={30} />
                    <GoogleIcon width={30} height={30} />
                </View>

                <Text style={styles.switchText}>
                    Don’t have an account? <Text style={styles.link} onPress={() => router.replace('/auth/signUp')}>Sign Up</Text>
                </Text>
            </View>
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
        marginBottom: 10,
        gap: 10,
    },
    switchText: {
        textAlign: 'center',
        marginTop: 10,
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

