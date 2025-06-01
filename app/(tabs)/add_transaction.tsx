import { View, Text, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRouter } from 'expo-router';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader'
import { ScrollView } from 'react-native-gesture-handler'
import PrimaryButton from '@/components/addTransaction/PrimaryButton'
import FormInput from '@/components/addTransaction/FormInput'
import CategorySelector from '@/components/addTransaction/CategorySelector'
import DateField from '@/components/addTransaction/DateField'
import TransactionTypeToggle from '@/components/addTransaction/TransactionTypeToggle'
import CategoryModal from '@/components/addTransaction/CategoryModal'
import { Category, CategoryGroupData, NavItem, TransactionTypeId as LocalTransactionTypeId } from '../../components/addTransaction/types';
import categories from '@/constants/categories';
import numeral from 'numeral';
import { createTransaction, CreateTransactionData, TransactionType as ApiTransactionType } from '@/services/transactionsService';
import { getMe } from '@/services/authService';

const AddTransaction = () => {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<LocalTransactionTypeId>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [transactionNameInput, setTransactionNameInput] = useState<string>(''); // New state for transaction name
  const [message, setMessage] = useState<string>(''); // This will now be just for 'detail'
  const [isCategoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    const fetchCurrentUserId = async () => {
      setIsLoadingUserId(true);
      const response = await getMe();
      if (response.success && response.data?.id) {
        setCurrentUserId(response.data.id);
      } else {
        console.error("Failed to fetch user ID:", response.message || response.error);
        Alert.alert("Error", "Could not fetch user information. Please try logging in again.");
      }
      setIsLoadingUserId(false);
    };

    fetchCurrentUserId();

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleTransactionTypeChange = (newType: LocalTransactionTypeId) => {
    setTransactionType(newType);
    if (newType === 'income') {
      setSelectedCategory(null);
    }
  };

  const handleSave = async () => {
    if (isSaving || isLoadingUserId) return;

    if (!currentUserId) {
      Alert.alert("Error", "User information is not available. Cannot save transaction.");
      return;
    }

    // Validation for new name field
    if (!transactionNameInput.trim()) {
      Alert.alert("Validation Error", "Transaction name is required.");
      return;
    }
    if (!amount || (transactionType !== 'income' && !selectedCategory)) {
      Alert.alert("Validation Error", "Please fill in all required fields (Amount and Category for expenses).");
      setIsSaving(false); // Ensure isSaving is reset if validation fails early
      return;
    }

    setIsSaving(true);

    let apiType: ApiTransactionType;
    if (transactionType === 'income') {
      apiType = 'income';
    } else if (selectedCategory?.id) { // Use selectedCategory.type for expense type
      apiType = selectedCategory.id as ApiTransactionType;
    } else {
      Alert.alert("Error", "Category type is missing for expense.");
      setIsSaving(false);
      return;
    }

    const transactionData: CreateTransactionData = {
      name: transactionNameInput.trim(), // Use the new dedicated name state
      type: apiType,
      amount: parseFloat(amount.replace(/,/g, '')),
      detail: message.trim() || null, // 'message' state is now purely for detail
      date: date.toISOString(),
    };

    console.log('Attempting to save transaction with data:', transactionData);

    try {
      const response = await createTransaction(transactionData);
      setIsSaving(false);

      if (response.success && response.data) {
        Keyboard.dismiss();
        Alert.alert("Success", response.message || "Transaction saved successfully!");
        setAmount('');
        setTransactionNameInput(''); // Reset new name field
        setMessage('');
        setSelectedCategory(null);
        setDate(new Date());
        setTransactionType('expense');
        router.replace('/transaction');
      } else {
        Alert.alert("Error Saving Transaction", response.message || response.error || "Could not save transaction. Please try again.");
      }
    } catch (error) {
      setIsSaving(false);
      console.error("Save transaction error:", error);
      Alert.alert("Error", "An unexpected error occurred while saving the transaction.");
    }
  };

  const handleCategorySelectFromModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
  };

  if (isLoadingUserId) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar />
      <View className="p-6">
        <GoBackToHomeHeader title='Add Transaction' />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="bg-primary-200 rounded-t-[50] flex-1">
          <ScrollView
            className="rounded-t-4xl flex-1"
            contentContainerStyle={{
              paddingTop: 24, paddingBottom: keyboardVisible ? 280 : 120
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-6 space-y-5">
              <TransactionTypeToggle
                transactionType={transactionType}
                onTypeChange={handleTransactionTypeChange}
              />
              <DateField
                label="Date"
                date={date}
                onDateChange={setDate}
                required
              />
              {transactionType !== 'income' && (
                <CategorySelector
                  label="Category"
                  selectedCategory={selectedCategory}
                  onOpenModal={() => setCategoryModalVisible(true)}
                  suggestedCategories={categories.suggestedCategoriesData}
                  onSuggestedSelect={setSelectedCategory}
                  required
                />
              )}
              {/* New FormInput for Transaction Name */}
              <FormInput
                label="Transaction Name"
                value={transactionNameInput}
                onChangeText={setTransactionNameInput}
                placeholder="Short name for the transaction"
                required // Make it required
              />
              <FormInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                formatAsCurrency={true}
                currencySymbol="$"
                required
              />
              <FormInput
                label="Note (Optional)" // Changed label to indicate it's optional
                value={message}
                onChangeText={setMessage}
                placeholder="Enter any additional details..."
                multiline
                numberOfLines={3} // Reduced lines as it's now just for notes
                inputWrapperStyle="h-24 items-start" // Adjusted height
              />
              <PrimaryButton
                title={isSaving ? "Saving..." : "Save"}
                onPress={handleSave}
                disabled={
                  isLoadingUserId ||
                  isSaving ||
                  !transactionNameInput.trim() || // Add validation for new name field
                  (transactionType !== 'income' && !selectedCategory) ||
                  !amount ||
                  !currentUserId
                }
                style="mt-4"
              />
            </View>
          </ScrollView>
          {transactionType !== 'income' && (
            <CategoryModal
              isVisible={isCategoryModalVisible}
              onClose={() => setCategoryModalVisible(false)}
              allCategories={categories.allCategoriesData}
              onSelectCategory={handleCategorySelectFromModal}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddTransaction;
