import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';


interface GoBackToHomeHeaderProps {
    title: string;
}

const GoBackToHomeHeader = ({ title }: GoBackToHomeHeaderProps) => {
    const router = useRouter();

    return (
        <View className="flex-row justify-between items-center mb-6 mx-3 mt-3">
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text className="text-lg font-pbold text-white">{title}</Text>
            <TouchableOpacity onPress={() => console.log('Notifications Pressed')}>
                <MaterialCommunityIcons name="bell-outline" size={28} color="white" />
            </TouchableOpacity>
        </View>
    )
}

export default GoBackToHomeHeader