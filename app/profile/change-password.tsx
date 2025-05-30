import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import { theme } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AuthTextInput from '@/components/AuthTextInput';

export default function ChangePasswordScreen() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Password does not match');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('https://6829e5e9ab2b5004cb35235d.mockapi.io/change-password/1', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'Password changed successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                                router.push('/profile');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Wrong current password');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Change Password</Text>
                <Ionicons name="notifications" size={24} color="#fff" />
            </View>

            <View style={styles.content}>
                <AuthTextInput
                    label='Current Password'
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    isPassword
                />

                <AuthTextInput
                    label="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    isPassword
                />

                <AuthTextInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    isPassword
                />
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Change</Text>}
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
        backgroundColor: theme.colors.violet600,
        padding: 30,
        paddingBottom: 16,
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    content: {
        height: '100%',
        padding: 30,
        paddingTop: 30,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        gap: 20,
    },
    buttonWrapper: {
        flexDirection: 'row',
        gap: '5%',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        minWidth: 100,
    },
    buttonText: { color: '#fff', fontWeight: '600' },
});

