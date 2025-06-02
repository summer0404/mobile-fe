import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import CircularProgressBar from './CircularProgress'

type HomeOverview2Props = {
  revenue: number;
  food: number;
  debtPercentage: number;
};

const HomeOverview2 = ({ revenue, food, debtPercentage }: HomeOverview2Props) => {
  return (
    <View className="bg-primary p-5 rounded-3xl flex-row items-center shadow-lg">
            <View className="flex-1 items-center pr-4 border-r border-white">
                <CircularProgressBar percentage={debtPercentage} />
            </View>
            <View className="flex-1 pl-4 space-y-4">
              <View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="white" />
                  <Text className="text-white text-xs ml-2">Income This Week</Text>
                </View>
                <Text className="text-white font-psemibold text-lg">${revenue}</Text>
              </View>
              <View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="white" />
                  <Text className="text-white text-xs ml-2">Food This Week</Text>
                </View>
                <Text className="text-secondary font-psemibold text-lg">-${food}</Text>
              </View>
            </View>
          </View>
  )
}

export default HomeOverview2