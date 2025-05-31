import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import { ScrollView } from 'react-native-gesture-handler';
import PrimaryButton from '@/components/addTransaction/PrimaryButton';
import FormInput from '@/components/addTransaction/FormInput';
import CategorySelector from '@/components/addTransaction/CategorySelector';
import DateField from '@/components/addTransaction/DateField';
import TransactionTypeToggle from '@/components/addTransaction/TransactionTypeToggle';
import CategoryModal from '@/components/addTransaction/CategoryModal';
import { Category, TransactionTypeId, TransactionItemData } from '@/components/addTransaction/types';
import categoriesData from '@/constants/categories'; // Renamed for clarity
import { updateTransaction, UpdateTransactionData, TransactionType as ApiTransactionType } from '@/services/transactionsService';
import { getMe } from '@/services/authService';

const EditTransactionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; transactionData?: string }>();
  const [transaction, setTransaction] = useState<TransactionItemData | null>(null);

  // Form state
  const [uiTransactionType, setUiTransactionType] = useState<TransactionTypeId>('expense'); // 'income' or 'expense' for UI toggle
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null); // This holds {id, name, icon}
  const [amount, setAmount] = useState<string>('');
  const [detail, setDetail] = useState<string>(''); // Corresponds to 'detail'

  // Modal and keyboard state
  const [isCategoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // API call related state
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // useEffect(() => {
  //   const fetchUserId = async () => {
  //     setIsLoadingUserId(true);
  //     const response = await getMe();
  //     if (response.success && response.data?.id) {
  //       setCurrentUserId(response.data.id);
  //     } else {
  //       Alert.alert("Error", "Could not load user information. Please try again.");
  //       router.back(); // Or redirect to login
  //     }
  //     setIsLoadingUserId(false);
  //   };
  //   fetchUserId();
  // }, [router]);

  useEffect(() => {
    if (params.transactionData) {
      try {
        const parsedData = JSON.parse(params.transactionData) as TransactionItemData;
        // Ensure dateObject is a Date instance
        if (parsedData.dateObject && typeof parsedData.dateObject === 'string') {
          parsedData.dateObject = new Date(parsedData.dateObject);
        }
        setTransaction(parsedData);
        setUiTransactionType(parsedData.type); // UI type 'income' or 'expense'
        setDate(new Date(parsedData.dateObject));
        setAmount(String(Math.abs(parsedData.amountRaw))); // Edit absolute value
        setDetail(parsedData.detail || '');

        if (parsedData.type === 'expense') {
            const categoryNameForLookup = parsedData.originalApiType;
            const foundCategory = categoriesData.allCategoriesData
              .flatMap(group => group.items)
              .find(cat => cat.id.toLowerCase() === categoryNameForLookup?.toLowerCase());
            setSelectedCategory(foundCategory || null);
        } else {
            setSelectedCategory(null); 
        }

      } catch (e) {
        console.error("Failed to parse transactionData for edit:", e);
        Alert.alert("Error", "Could not load transaction data for editing.");
        router.back();
      }
    } else if (params.id) {
      // Fallback or if you fetch by ID (not implemented here, relies on transactionData)
      Alert.alert("Error", "Transaction data not provided directly. Please ensure data is passed.");
      router.back();
    }
  }, [params.id, params.transactionData, router]);


  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleUpdate = async () => {
    if (!transaction) {
        Alert.alert("Error", "Transaction data is missing. Cannot update.");
        return;
    }

    if (uiTransactionType === 'expense' && !selectedCategory) {
      Alert.alert("Validation Error", "Please select a category for your expense.");
      return;
    }
    if (!amount) {
      Alert.alert("Validation Error", "Please enter an amount.");
      return;
    }

    Keyboard.dismiss();
    setIsUpdating(true);

    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive amount.");
      setIsUpdating(false);
      return;
    }

    const apiType: ApiTransactionType = uiTransactionType === 'income' ?
      'income' : // Default 'income' type for API when UI tab is income
      selectedCategory!.id as ApiTransactionType; // selectedCategory is guaranteed for expense by validation

    const payload: UpdateTransactionData = {
      name: transaction.title, // Or make name editable if needed
      type: apiType,
      amount: numericAmount,
      detail: detail,
      date: date.toISOString(),
    };

    console.log('Updating Transaction with ID:', transaction.id, 'Payload:', payload);

    const response = await updateTransaction(transaction.id, payload);

    setIsUpdating(false);

    if (response.success && response.data) {
      Alert.alert("Success", "Transaction updated successfully!");
      router.back();
    } else {
      Alert.alert("Update Failed", response.message || response.error || "Could not update transaction.");
    }
  };

  const handleCategorySelectFromModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
    // If the selected category implies a change in 'income' vs 'expense' for UI toggle:
    // This depends on how your categories are structured.
    // For example, if 'Salary' category is always 'income':
    // if (category.name.toLowerCase() === 'salary' || category.name.toLowerCase() === 'income') { // Example
    //   setUiTransactionType('income');
    // } else {
    //   setUiTransactionType('expense');
    // }
  };

  if ( !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Loading transaction...</Text>
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
                transactionType={uiTransactionType}
                onTypeChange={(newType) => {
                  setUiTransactionType(newType);
                  setSelectedCategory(null); // Clear category when type changes
                }}
              />
              <DateField
                label="Date"
                date={date}
                onDateChange={setDate}
                required
              />
              {uiTransactionType === 'expense' && (
                <CategorySelector
                  label="Category"
                  selectedCategory={selectedCategory}
                  onOpenModal={() => setCategoryModalVisible(true)}
                  suggestedCategories={categoriesData.suggestedCategoriesData} // Consider filtering these for expense
                  onSuggestedSelect={setSelectedCategory}
                  required
                />
              )}
              <FormInput
                label="Amount"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                formatAsCurrency={true} // Assuming your FormInput handles this
                currencySymbol="$"
                required
                keyboardType="numeric"
              />
              <FormInput
                label="Detail / Message"
                value={detail}
                onChangeText={setDetail}
                placeholder="Enter a message or note..."
                multiline
                numberOfLines={4}
                inputWrapperStyle="h-28 items-start"
              />
              <PrimaryButton
                title={isUpdating ? "Updating..." : "Update Transaction"}
                onPress={handleUpdate}
                disabled={
                  (uiTransactionType === 'expense' && !selectedCategory) ||
                  !amount ||
                  isUpdating
                }
                style="mt-4"
              />
            </View>
          </ScrollView>
          <CategoryModal
            isVisible={isCategoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
            allCategories={categoriesData.allCategoriesData}
            onSelectCategory={handleCategorySelectFromModal}
            // currentTransactionType={uiTransactionType} // Pass this if modal needs to filter by type
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditTransactionScreen;