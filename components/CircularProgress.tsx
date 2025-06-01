import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface CircularProgressBarProps {
    percentage: number; 
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage }) => {
    return (
        <View className="flex-1 justify-center items-center">
            <AnimatedCircularProgress
                size={80}
                width={5}
                fill={percentage} // Percentage of debt paid
                tintColor="#00BFFF" // Blue color for the progress ring (can be changed)
                backgroundColor="#FFFFFF" // White background for the ring
                rotation={0}
                lineCap="round"
            >
                {() => (
                    <MaterialCommunityIcons name="cash-minus" size={40} color="white" />
                )}
            </AnimatedCircularProgress>
            {/* Changed text to reflect debt progress */}
            <Text className="text-white font-psemibold text-center mt-1">Debt Paid</Text>
            <Text className="text-white text-xs text-center font-pregular">{percentage}% Cleared</Text>
        </View>
    );
};

export default CircularProgressBar;