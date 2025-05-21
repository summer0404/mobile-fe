import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ExpenseBar from './ExpenseBar'

const HomeOverview = () => {
    return (
        <>
        <View className="flex-row justify-around items-center my-4">
            <View className="items-center">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="arrow-top-right-bold-box-outline" size={24} color="white" />
                    <Text className="text-xs text-white ml-1 font-pregular">Total Balance</Text>
                </View>
                <Text className="text-3xl font-bold text-white mt-1">$7,783.00</Text>
            </View>
            <View className="w-px h-12 bg-white" />
            <View className="items-center">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="arrow-bottom-right-bold-box-outline" size={24} color="white" />                
                    <Text className="text-xs text-white ml-1 font-pregular">Total Expense</Text>
                </View>
                <Text className="text-3xl font-bold text-secondary mt-1">-$1.187.40</Text>
            </View>
        </View>
        <ExpenseBar percentage={30} amount={200000} />
        </>
    )
}
export default HomeOverview;