import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

// Define props interface for the ExpenseBar component
interface ExpenseBarProps {
    percentage: number;
    amount: number;
}

const ExpenseBar: React.FC<ExpenseBarProps> = ({ percentage, amount }) => {
    const [progressWidth, setProgressWidth] = useState<number>(0);


    return (
        <View className="mt-4">
            <View className="h-8 bg-black rounded-full overflow-hidden relative flex-row">
                {/* White progress section (positioned on the right) */}
                <View
                    className="absolute right-0 px-4 h-full bg-[#F1FFF3] rounded-l-full items-end justify-center"
                    style={{
                        width: `${100 - percentage}%`,
                    }}
                >
                    <Text className="text-sm font-semibold text-black">${amount}</Text>
                </View>
                
                {/* Text positioned in the black section (left side) */}
                <View className="px-4 h-full justify-center z-10">
                    <Text className="text-sm font-semibold text-white">{percentage}%</Text>
                </View>
            </View>
            <Text className="text-center text-sm text-white mt-2 font-plight">
                {percentage}% Of Your Expenses, Looks Good.
            </Text>
        </View>
    );
};


export default ExpenseBar;