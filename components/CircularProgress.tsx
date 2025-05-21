import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Svg, { Path } from 'react-native-svg';

interface CircularProgressBarProps {
    percentage: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({ percentage }) => {
    return (
        <View className="flex-1 justify-center items-center">
            <AnimatedCircularProgress
                size={80}
                width={5}
                fill={percentage}
                tintColor="#00BFFF" // Blue color for the progress ring
                backgroundColor="#FFFFFF" // White background for the ring
                rotation={0}
                lineCap="round"
            >
                {() => (
                    <MaterialCommunityIcons name="car-outline" size={40} color="white" />
                )}
            </AnimatedCircularProgress>
            <Text className="text-white font-psemibold text-center">Savings</Text>
            <Text className="text-white text-xs text-center font-pregular">On Goals</Text>
        </View>
    );
};

export default CircularProgressBar;