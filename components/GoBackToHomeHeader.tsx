import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';


interface GoBackToHomeHeaderProps {
    title: string;
}

const GoBackToHomeHeader = ({ title }: GoBackToHomeHeaderProps) => {
    const router = useRouter();
    const canGoBack = router.canGoBack();

    const handleBackPress = () => {
        if (canGoBack) {
            router.back();
        } else {
            router.replace('/home'); 
        }
    };

    return (
        <View className="flex-row justify-between items-center mb-6 mx-2 mt-3">
            <TouchableOpacity onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text className="text-lg font-pbold text-white flex-1 text-center">{title}</Text>
            {/* Empty view to balance the layout */}
            <View className="w-7" />
        </View>
    )
}

export default GoBackToHomeHeader