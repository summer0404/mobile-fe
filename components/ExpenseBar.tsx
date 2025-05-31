import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

// Define props interface for the ExpenseBar component
interface ExpenseBarProps {
    percentage: number;
    amount: number;
}

const ExpenseBar: React.FC<ExpenseBarProps> = ({ percentage, amount }) => {
    const [progressWidth, setProgressWidth] = useState<number>(0);

    const getDynamicComment = (p: number): string => {
        const roundedPercentage = Math.round(p); // Use rounded percentage for messages
        if (roundedPercentage <= 0) {
            return "No expenses recorded yet. Keep it up!";
        } else if (roundedPercentage < 25) {
            return `Just ${roundedPercentage}% spent! Excellent budgeting! ✨`;
        } else if (roundedPercentage < 50) {
            return `${roundedPercentage}% of income spent. Looking good, savvy spender! 👍`;
        } else if (roundedPercentage < 75) {
            return `${roundedPercentage}% used. Expenses are moderate, stay mindful!`;
        } else if (roundedPercentage < 90) {
            return `Careful, ${roundedPercentage}% of income spent. Time for a quick check-in? 🤔`;
        } else if (roundedPercentage < 100) {
            return `Whoa, ${roundedPercentage}% spent! Nearing the limit, let's review. 🚦`;
        } else if (roundedPercentage === 100) {
            return "Expenses match income exactly. Perfect balance or time to save? ⚖️";
        } else { // percentage > 100
            return `Uh oh, ${roundedPercentage}%! Expenses have exceeded income. Let's strategize! 💸`;
        }
    };


    return (
        <View className="mt-4">
            <View className="h-8 bg-black rounded-full overflow-hidden relative flex-row">
                {/* White progress section (positioned on the right) */}
                <View
                    className="absolute right-0 px-4 h-full bg-[#F1FFF3] rounded-l-full items-end justify-center"
                    style={{
                        // Ensure percentage doesn't go below 0 or above 100 for width calculation
                        width: `${Math.max(0, Math.min(100, 100 - percentage))}%`,
                    }}
                >
                    <Text className="text-sm font-psemibold text-black">${amount.toFixed(2)}</Text>
                </View>
                
                {/* Text positioned in the black section (left side) */}
                <View className="px-4 h-full justify-center z-10">
                     {/* Ensure percentage display is also capped for visual consistency if needed, or show actual */}
                    <Text className="text-sm font-psemibold text-white">{Math.round(percentage)}%</Text>
                </View>
            </View>
            <Text className="text-center text-sm text-white mt-2 font-plight">
                {getDynamicComment(percentage)}
            </Text>
        </View>
    );
};


export default ExpenseBar;