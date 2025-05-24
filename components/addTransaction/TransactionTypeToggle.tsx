// components/TransactionTypeToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionTypeId } from './types'; // Adjust path if necessary

interface TransactionTypeToggleProps {
  transactionType: TransactionTypeId;
  onTypeChange: (type: TransactionTypeId) => void;
}

interface ToggleTypeOption {
  id: TransactionTypeId;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

const TransactionTypeToggle: React.FC<TransactionTypeToggleProps> = ({
  transactionType,
  onTypeChange,
}) => {
  const types: ToggleTypeOption[] = [
    { id: 'expense', label: 'Expense', icon: 'arrow-bottom-left-thick' },
    { id: 'income', label: 'Income', icon: 'arrow-top-right-thick' },
  ];

  return (
    <View className="flex-row bg-slate-200 rounded-full p-1">
      {types.map((type) => (
        <TouchableOpacity
          key={type.id}
          className={`flex-1 py-2.5 rounded-full items-center justify-center ${
            transactionType === type.id ? 'bg-white shadow' : ''
          }`}
          onPress={() => onTypeChange(type.id)}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name={type.icon}
              size={20}
              color={transactionType === type.id ? '#6A0DAD' : '#6B7280'}
            />
            <Text className={`font-semibold ml-1.5 ${transactionType === type.id ? 'text-primary' : 'text-gray-600'}`}>
              {type.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TransactionTypeToggle;