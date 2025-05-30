// components/TransactionTypeToggle.tsx (StyleSheet version)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionTypeId } from './types';

interface TransactionTypeToggleProps {
  transactionType: TransactionTypeId;
  onTypeChange: (type: TransactionTypeId) => void;
}

interface ToggleTypeOption {
  id: TransactionTypeId;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}

const TransactionTypeToggleComponent: React.FC<TransactionTypeToggleProps> = ({
  transactionType,
  onTypeChange,
}) => {
  const types: ToggleTypeOption[] = [
    { id: 'expense', label: 'Expense', icon: 'arrow-bottom-left-thick' },
    { id: 'income', label: 'Income', icon: 'arrow-top-right-thick' },
  ];

  return (
    <View style={styles.outerContainer}>
      {types.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.buttonBase,
            transactionType === type.id && styles.activeButton,
          ]}
          onPress={() => onTypeChange(type.id)}
        >
          <View style={styles.buttonInnerContent}>
            <MaterialCommunityIcons
              name={type.icon}
              size={20}
              color={transactionType === type.id ? '#6A0DAD' : '#6B7280'} // primary or gray-500
            />
            <Text
              style={[
                styles.textBase,
                transactionType === type.id ? styles.activeText : styles.inactiveText,
              ]}
            >
              {type.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { // Approximates: "flex-row bg-slate-200 rounded-full p-1"
    flexDirection: 'row',
    backgroundColor: 'rgb(226, 232, 240)', // slate-200
    borderRadius: 9999, // rounded-full
    padding: 4, // p-1 (Tailwind p-1 is 0.25rem = 4px usually)
  },
  buttonBase: { // Approximates: "flex-1 py-2.5 rounded-full items-center justify-center"
    flex: 1,
    paddingVertical: 10, // py-2.5 (0.625rem = 10px)
    borderRadius: 9999, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: { // Approximates: "bg-white shadow"
    backgroundColor: 'white',
    // Shadow (platform-dependent for exact match)
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)', // Tailwind default shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3, // Adjust elevation for desired shadow intensity
      },
    }),
  },
  buttonInnerContent: { // Approximates: "flex-row items-center"
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBase: { // Approximates: "font-semibold ml-1.5"
    // For "font-semibold", you'd need to use the actual Poppins-SemiBold font if loaded
    fontFamily: 'Poppins-SemiBold', // Assuming you have this font loaded
    fontWeight: '600', // Fallback if font family isn't set up for StyleSheet
    marginLeft: 6, // ml-1.5 (0.375rem = 6px)
  },
  activeText: { // Approximates: "text-primary"
    color: '#6A0DAD', // Your primary color
  },
  inactiveText: { // Approximates: "text-gray-600"
    color: 'rgb(75, 85, 99)', // gray-600
  },
});

export default React.memo(TransactionTypeToggleComponent); // Still recommend memo