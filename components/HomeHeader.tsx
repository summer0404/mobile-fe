import { View, Text } from "react-native";
import React from "react";
import InitialsAvatar from "./profile/InitialsAvatar";

interface HomeHeaderProps {
  firstName: string;
  lastName: string;
}

const HomeHeader = ({ firstName, lastName }: HomeHeaderProps) => {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View>
        <Text className="text-2xl font-pbold text-white">
          Hi, Welcome Back
        </Text>
        <Text className="text-sm text-white font-pmedium">Good Morning</Text>
      </View>
      {/* <View className="w-12 h-12 bg-[#FEF9C3] rounded-full justify-center items-center">
        <Text className="text-gray-950 font-pbold text-lg">HS</Text>
      </View> */}
      <InitialsAvatar firstName={firstName} lastName={lastName} size={30} fontSize={12} /> 
    </View>
  );
};

export default HomeHeader;
