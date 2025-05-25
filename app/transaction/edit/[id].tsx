import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Keyboard, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import { ScrollView } from 'react-native-gesture-handler';
import PrimaryButton from '@/components/addTransaction/PrimaryButton';
import FormInput from '@/components/addTransaction/FormInput';
import CategorySelector from '@/components/addTransaction/CategorySelector';
import DateField from '@/components/addTransaction/DateField';
import TransactionTypeToggle from '@/components/addTransaction/TransactionTypeToggle';
import CategoryModal from '@/components/addTransaction/CategoryModal';
import { Category, CategoryGroupData, TransactionTypeId, TransactionItemData } from '@/components/addTransaction/types'; // Ensure TransactionItemData is imported
import dummyTransactions from '@/constants/dummyTransactions'; 
import categories from '@/constants/categories'


const EditTransactionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; transactionData?: string }>();
  const [transaction, setTransaction] = useState<TransactionItemData | null>(null);

  const [transactionType, setTransactionType] = useState<TransactionTypeId>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string>(''); // Corresponds to 'detail'
  const [isCategoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    let initialTransaction: TransactionItemData | undefined;
    if (params.transactionData) {
      try {
        const parsedData = JSON.parse(params.transactionData);
        if (parsedData.dateObject && typeof parsedData.dateObject === 'string') {
          parsedData.dateObject = new Date(parsedData.dateObject);
        }
        initialTransaction = parsedData as TransactionItemData;
      } catch (e) {
        console.error("Failed to parse transactionData for edit:", e);
        Alert.alert("Error", "Could not load transaction data for editing.");
        router.back();
        return;
      }
    } else if (params.id) {
      // Fallback to find in dummy if not passed directly (though passing is better)
      initialTransaction = dummyTransactions.find(t => t.id === params.id);
    }

    if (initialTransaction) {
      setTransaction(initialTransaction);
      setTransactionType(initialTransaction.type);
      setDate(new Date(initialTransaction.dateObject)); // Ensure date is a Date object
      // Find category object from allCategoriesData based on categoryDisplay or an ID if you have one
      const foundCategory = categories.allCategoriesData.flatMap(group => group.items).find(cat => cat.name === initialTransaction.categoryDisplay);
      setSelectedCategory(foundCategory || null);
      setAmount(initialTransaction.amountRaw.toString()); // Use amountRaw for editing
      setMessage(initialTransaction.detail || '');
    } else {
      Alert.alert("Error", "Transaction not found for editing.");
      router.back();
    }
  }, [params.id, params.transactionData]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleUpdate = () => {
    if (!transaction) return;

    console.log('Updated Data:', {
      id: transaction.id,
      transactionType,
      date,
      selectedCategory,
      amount,
      message,
    });
    Alert.alert("Success", "Transaction updated (simulated).");
    router.replace({ pathname: '/transaction/[id]', params: { id: transaction.id } });
    Keyboard.dismiss();
  };

  const handleCategorySelectFromModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
  };

  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <Text className="text-white">Loading transaction...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <View className="p-6">
        <GoBackToHomeHeader title='Edit Transaction' />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="bg-primary-200 rounded-t-[50px] flex-1">
          <ScrollView
            className="rounded-t-4xl flex-1"
            contentContainerStyle={{ paddingTop: 24, paddingBottom: keyboardVisible ? 280 : 120 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                suggestedCategories={categories.suggestedCategoriesData} // You might want to adjust this
                onSuggestedSelect={setSelectedCategory}
                required
              />
              <FormInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                formatAsCurrency={true}
                currencySymbol="$"
                required
                keyboardType="numeric"
              />
              <FormInput
                label="Detail / Message"
                value={message}
                onChangeText={setMessage}
                placeholder="Enter a message or note..."
                multiline
                numberOfLines={4}
                inputWrapperStyle="h-28 items-start"
              />
              <PrimaryButton
                title="Update Transaction"
                onPress={handleUpdate}
                disabled={!selectedCategory || !amount}
                style="mt-4"
              />
            </View>
          </ScrollView>
          <CategoryModal
            isVisible={isCategoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
            allCategories={categories.allCategoriesData} // Ensure this is available
            onSelectCategory={handleCategorySelectFromModal}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditTransactionScreen;