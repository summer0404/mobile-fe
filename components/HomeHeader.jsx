import { View, Text } from "react-native";
import React from "react";

const HomeHeader = () => {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View>
        <Text className="text-2xl font-pbold text-white">
          Hi, Welcome Back
        </Text>
        <Text className="text-sm text-white font-pmedium">Good Morning</Text>
      </View>
      <View className="w-12 h-12 bg-[#FEF9C3] rounded-full justify-center items-center">
        <Text className="text-gray-950 font-bold text-lg">HS</Text>
      </View>
    </View>
  );
};

export default HomeHeader;
