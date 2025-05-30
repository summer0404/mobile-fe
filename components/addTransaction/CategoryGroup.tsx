// components/CategoryGroup.tsx
import React from 'react';
import { View, Text } from 'react-native';
import CategoryItem from './CategoryItem';
import { Category } from './types'; 

interface CategoryGroupProps {
  groupName: string;
  items: Category[];
  onCategorySelect: (category: Category) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ groupName, items, onCategorySelect }) => {
  if (!items || items.length === 0) return null;

  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-textDark/80 mb-3">{groupName}</Text>
      <View className="flex-row flex-wrap -m-1.5">
        {items.map((item) => (
          <CategoryItem key={item.id} item={item} onPress={onCategorySelect} />
        ))}
      </View>
    </View>
  );
};

export default CategoryGroup;