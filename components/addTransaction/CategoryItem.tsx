// components/CategoryItem.tsx
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from './types';

interface CategoryItemProps {
  item: Category;
  onPress: (category: Category) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="w-1/3 p-1.5"
    >
      <View className={`items-center justify-center p-4 rounded-xl shadow-sm ${item.bgColor}`}>
        <Text className={item.iconColor} >
        <MaterialCommunityIcons name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={32} />
        </Text>
        <Text className={`mt-1.5 text-xs font-pmedium ${item.iconColor}`}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryItem;