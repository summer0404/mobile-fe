import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import InitialsAvatar from './profile/InitialsAvatar';
import { getMe, UserProfile } from '../services/authService';

interface GoBackToHomeHeaderProps {
    title: string;
}

const GoBackToHomeHeader = ({ title }: GoBackToHomeHeaderProps) => {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<{
        firstName: string;
        lastName: string;
    }>({
        firstName: '',
        lastName: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canGoBack = router.canGoBack();

    const fetchUserInfo = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            console.log('[GoBackToHomeHeader] Fetching user info...');
            const response = await getMe();
            
            if (response.success && response.data) {
                console.log('[GoBackToHomeHeader] User info fetched successfully:', {
                    firstName: response.data.firstName,
                    lastName: response.data.lastName
                });
                
                setUserInfo({
                    firstName: response.data.firstName || 'User',
                    lastName: response.data.lastName || ''
                });
            } else {
                console.log('[GoBackToHomeHeader] Failed to fetch user info:', response.message);
                setError(response.message || 'Failed to fetch user data');
                
                // Set default values if API call fails
                setUserInfo({
                    firstName: 'User',
                    lastName: ''
                });
            }
        } catch (error) {
            console.error('[GoBackToHomeHeader] Error fetching user info:', error);
            setError('Network error');
            setUserInfo({
                firstName: 'User',
                lastName: ''
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const handleBackPress = () => {
        if (canGoBack) {
            router.back();
        } else {
            router.replace('/home'); 
        }
    };

    const handleAvatarPress = () => {
        // Retry fetching user info if there was an error
        if (error) {
            fetchUserInfo();
        }
        router.push('/profile');
    };

    return (
        <View className="flex-row justify-between items-center mb-6 mx-2 mt-3">
            <TouchableOpacity onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            
            <Text className="text-lg font-pbold text-white flex-1 text-center">{title}</Text>
            
            {/* InitialsAvatar with fetched user info */}
            <TouchableOpacity onPress={handleAvatarPress}>
                {isLoading ? (
                    // Loading placeholder
                    <View className="w-9 h-9 bg-white/20 rounded-full animate-pulse" />
                ) : (
                    <InitialsAvatar 
                        firstName={userInfo.firstName}
                        lastName={userInfo.lastName}
                       size={30} fontSize={12}     
                    />
                )}
            </TouchableOpacity>
        </View>
    )
}

export default GoBackToHomeHeader