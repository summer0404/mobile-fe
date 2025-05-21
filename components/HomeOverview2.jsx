import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import CircularProgressBar from './CircularProgress'

const HomeOverview2 = ({revenue, food}) => {
  return (
    <View className="bg-primary p-5 rounded-3xl flex-row items-center shadow-lg">
            <View className="flex-1 items-center pr-4 border-r border-white">
              {/* <View className="w-20 h-20 bg-accent/30 rounded-full justify-center items-center border-2 border-blu mb-2">
                <MaterialCommunityIcons name="car-outline" size={40} color="white" />
              </View> */}
                <CircularProgressBar percentage={30} />
              
            </View>
            <View className="flex-1 pl-4 space-y-4">
              <View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="cash-multiple" size={24} color="white" />
                  <Text className="text-white text-xs ml-2">Revenue Last Week</Text>
                </View>
                <Text className="text-white font-psemibold text-lg">$4.000.00</Text>
              </View>
              <View>
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="white" />
                  <Text className="text-white text-xs ml-2">Food Last Week</Text>
                </View>
                <Text className="text-secondary font-psemibold text-lg">-$100.00</Text>
              </View>
            </View>
          </View>
  )
}

export default HomeOverview2