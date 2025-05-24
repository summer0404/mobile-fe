import { View, Text, SafeAreaView, StatusBar } from 'react-native'
import React, { useState } from 'react'
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader'
import { ScrollView } from 'react-native-gesture-handler'
import PrimaryButton from '@/components/addTransaction/PrimaryButton'
import FormInput from '@/components/addTransaction/FormInput'
import CategorySelector from '@/components/addTransaction/CategorySelector'
import DateField from '@/components/addTransaction/DateField'
import TransactionTypeToggle from '@/components/addTransaction/TransactionTypeToggle'
import CategoryModal from '@/components/addTransaction/CategoryModal'
import { Category, CategoryGroupData, NavItem, TransactionTypeId } from '../../components/addTransaction/types';

const allCategoriesData: CategoryGroupData[] = [
  {
    groupName: 'Living expenses',
    items: [
      { id: 'food', name: 'Food', icon: 'silverware-fork-knife', iconColor: 'text-orange-500', bgColor: 'bg-orange-100' },
      { id: 'groceries', name: 'Groceries', icon: 'cart-outline', iconColor: 'text-green-500', bgColor: 'bg-green-100' },
      { id: 'transport', name: 'Transport', icon: 'car-outline', iconColor: 'text-blue-500', bgColor: 'bg-blue-100' },
    ],
  },
  {
    groupName: 'Incidental expenses',
    items: [
      { id: 'shopping', name: 'Shopping', icon: 'shopping-outline', iconColor: 'text-pink-500', bgColor: 'bg-pink-100' },
      { id: 'entertainment', name: 'Entertainment', icon: 'movie-open-outline', iconColor: 'text-purple-500', bgColor: 'bg-purple-100' },
    ],
  },
   {
    groupName: 'Fixed expenses',
    items: [
      { id: 'bills', name: 'Bills', icon: 'receipt', iconColor: 'text-indigo-500', bgColor: 'bg-indigo-100' },
      { id: 'home', name: 'Home', icon: 'home-outline', iconColor: 'text-amber-500', bgColor: 'bg-amber-100' },
    ],
  },
];
const suggestedCategoriesData: Category[] = allCategoriesData[0]?.items.slice(0, 3) || [];
const AddTransaction = () => {
   const [transactionType, setTransactionType] = useState<TransactionTypeId>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  const handleSave = () => {
    console.log({ transactionType, date, selectedCategory, amount, message });

  };

  const handleCategorySelectFromModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
  };
  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar backgroundColor='#7C3AED' />
      
      {/* Fixed header section */}
      <View className="p-6">
        <GoBackToHomeHeader title='Add Transaction' />
      </View>
      
      {/* Scrollable content section */}
      <View className="bg-primary-200 rounded-t-[50] flex-1">
        
        {/* Scrollable content below filters */}
         <ScrollView
        className="bg-lightBg rounded-t-4xl flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 space-y-5">
          <TransactionTypeToggle
            transactionType={transactionType}
            onTypeChange={setTransactionType}
          />
          <DateField
            label="Date"
            date={date}
            onDateChange={setDate}
            required
          />
          <CategorySelector
            label="Category"
            selectedCategory={selectedCategory}
            onOpenModal={() => setCategoryModalVisible(true)}
            suggestedCategories={suggestedCategoriesData}
            onSuggestedSelect={setSelectedCategory}
            required
          />
          <FormInput
            label="Amount"
            value={amount} // Pass the raw numeric string
            onChangeText={setAmount} // setAmount will receive the raw numeric string
            placeholder="0" // Updated placeholder
            formatAsCurrency={true} // Enable formatting
            currencySymbol="$" // Optional: if you want to show a currency symbol
            required
          />
          <FormInput
            label="Enter Message"
            value={message}
            onChangeText={setMessage}
            placeholder="Enter a message or note..."
            multiline
            inputStyle="h-28"
          />
          <PrimaryButton
            title="Save"
            onPress={handleSave}
            disabled={!selectedCategory || !amount}
            style="mt-4" // NativeWind specific, keep as string
          />
        </View>
      </ScrollView>
       <CategoryModal
        isVisible={isCategoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        allCategories={allCategoriesData}
        onSelectCategory={handleCategorySelectFromModal}
      />
      </View>
    </SafeAreaView>
  )
}

export default AddTransaction;
