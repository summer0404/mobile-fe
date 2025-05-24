// components/CategorySelector.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Category } from './types'; 

interface CategorySelectorProps {
  label: string;
  selectedCategory: Category | null;
  onOpenModal: () => void;
  onSuggestedSelect: (category: Category) => void;
  suggestedCategories?: Category[];
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  label,
  selectedCategory,
  onOpenModal,
  onSuggestedSelect,
  suggestedCategories = [],
  required = false,
}) => {
  return (
    <View>
      <Text className="text-sm font-pmedium text-black mb-1.5">
        {label}
        {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        onPress={onOpenModal}
        className="bg-[#F5F5F5] p-3.5 rounded-full flex-row justify-between items-center shadow-sm"
      >
        <Text className={selectedCategory ? "text-black" : "text-textMuted"}>
          {selectedCategory ? selectedCategory.name : 'Select the category'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={24} color="#A0A0A0" />
      </TouchableOpacity>
      {suggestedCategories.length > 0 && (
        <View className="flex-row space-x-2 mt-2.5">
          {suggestedCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSuggestedSelect(cat)}
              className="bg-slate-200 px-3 py-1.5 rounded-full"
            >
              <Text className="text-xs text-black/80">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default CategorySelector;