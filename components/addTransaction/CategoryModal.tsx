// components/CategoryModal.tsx
import React, { useState, useMemo } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CategoryModalHeader from './CategoryModalHeader';
import CategoryGroup from './CategoryGroup';
import { Category, CategoryGroupData } from './types'; // Adjust path

interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  allCategories: CategoryGroupData[];
  onSelectCategory: (category: Category) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  onClose,
  allCategories,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories: CategoryGroupData[] = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    return allCategories
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(group => group.items.length > 0);
  }, [allCategories, searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const handleSelect = (category: Category) => {
    setSearchQuery(''); // Reset search before calling onSelectCategory
    onSelectCategory(category);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-5 pt-4 pb-3 bg-primary-200">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-pbold text-primary">Choose Category</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close-circle" size={30} color="#A0A0A0" />
            </TouchableOpacity>
          </View>
          <CategoryModalHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateNewPress={() => console.log('Create new category pressed')}
          />
        </View>

        <ScrollView className="flex-1 px-5 pt-2">
          {filteredCategories.map((group, groupIndex) => (
            <CategoryGroup
              key={groupIndex}
              groupName={group.groupName}
              items={group.items}
              onCategorySelect={handleSelect}
            />
          ))}
          {filteredCategories.length === 0 && (
            <Text className="text-center text-textMuted mt-10">No categories found.</Text>
          )}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default CategoryModal;