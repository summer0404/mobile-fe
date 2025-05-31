import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const IncomeExpense = () => {
    return (
        <View className="flex-row justify-around items-center mt-6 mb-4">
            <View className="items-center">
                <View className="flex-row items-center mb-1">

                    <MaterialCommunityIcons name="arrow-top-right-bold-box-outline" size={40} color="#00D09E" />
                    <Text className="text-sm text-black">Income</Text>
                </View>
                <Text className="text-xl font-pbold text-black">$4,120.00</Text>
            </View>
            <View className="items-center">
                <View className="flex-row items-center mb-1">

                    <MaterialCommunityIcons name="arrow-bottom-left-bold-box-outline" size={40} color="#0068FF" />
                    <Text className="text-sm text-black">Expense</Text>
                </View>
                <Text className="text-xl font-pbold text-[#0068FF]">$1.187.40</Text>
            </View>
        </View>
    )
}

export default IncomeExpense