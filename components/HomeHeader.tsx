import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import InitialsAvatar from "./profile/InitialsAvatar";
import { useRouter } from "expo-router";

interface HomeHeaderProps {
  firstName: string;
  lastName: string;
}

const HomeHeader = ({ firstName, lastName }: HomeHeaderProps) => {
  const router = useRouter();
   const handleAvatarPress = () => {
        router.push('/profile');
    };
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View>
        <Text className="text-2xl font-pbold text-white">
          Hi, Welcome Back
        </Text>
        <Text className="text-sm text-white font-pmedium">Ready to track your finances?</Text>
      </View>
       <TouchableOpacity onPress={handleAvatarPress}>
      <InitialsAvatar firstName={firstName} lastName={lastName} size={30} fontSize={12} />
      </TouchableOpacity> 
    </View>
  );
};

export default HomeHeader;
