// components/CategoryModalHeader.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CategoryModalHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNewPress: () => void;
}

const CategoryModalHeader: React.FC<CategoryModalHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onCreateNewPress,
}) => {
  return (
    <View className="flex-row items-center space-x-3 mb-4">
      <TextInput
        className="flex-1 bg-white p-3 rounded-lg text-textDark shadow-sm border border-slate-300"
        placeholder="Search"
        placeholderTextColor="#A0A0A0"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {/* <TouchableOpacity
        onPress={onCreateNewPress}
        className="bg-primary/10 px-4 py-3 rounded-lg flex-row items-center"
      >
        <MaterialCommunityIcons name="plus" size={20} color="rgb(106, 13, 173)" />
        <Text className="text-primary font-medium ml-1 text-sm">Create new</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default CategoryModalHeader;