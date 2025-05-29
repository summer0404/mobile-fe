import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthTextInput from '../../components/AuthTextInput';
import { useState } from 'react';
import { router } from 'expo-router';
import React from 'react';
import { theme } from '../../utils/theme';
import FacebookIcon from '../../assets/images/facebook.svg'
import GoogleIcon from '../../assets/images/google.svg'


export default function SignIn() {
    const [username, setUsername] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [password, setPassword] = useState('');
    const [conPassword, setConPassword] = useState('');


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.subContainer}>
                <AuthTextInput label="Username or Email" value={username} onChangeText={setUsername} />
                <AuthTextInput label="First Name" value={firstname} onChangeText={setFirstname} />
                <AuthTextInput label="Last Name" value={lastname} onChangeText={setLastname} />
                <AuthTextInput label="Password" value={password} onChangeText={setPassword} isPassword />
                <AuthTextInput label="Confirm Password" value={conPassword} onChangeText={setConPassword} isPassword />

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <Text style={styles.fingerprintText}><Text style={{ color: 'orange' }}></Text></Text>

                <Text style={styles.orText}>or sign up with</Text>
                <View style={styles.iconRow}>
                    <FacebookIcon width={30} height={30} />
                    <GoogleIcon width={30} height={30} />
                </View>

                <Text style={styles.switchText}>
                    Already have an account? <Text style={styles.link} onPress={() => router.replace('/auth/signIn')}>Sign In</Text>
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
        paddingTop: 30,
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
        margin: 0,
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
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        marginTop: 0,
        textAlign: 'center',
        fontWeight: '600',
    },
    orText: {
        textAlign: 'center',
        marginVertical: 5,
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
        marginTop: 0,
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
        marginTop: 0,
    },
});

