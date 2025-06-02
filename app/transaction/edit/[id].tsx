import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
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
import categoriesData from '@/constants/categories';
import { updateTransaction, UpdateTransactionData, TransactionType as ApiTransactionType } from '@/services/transactionsService';
import CustomAlert from '@/components/Alert';

const EditTransactionScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; transactionData?: string }>();
  const [transaction, setTransaction] = useState<TransactionItemData | null>(null);

  // Form state
  const [uiTransactionType, setUiTransactionType] = useState<TransactionTypeId>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [name, setName] = useState<string>('');

  // Modal and keyboard state
  const [isCategoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // API call related state
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');
  const [alertOnConfirm, setAlertOnConfirm] = useState<(() => void) | undefined>(undefined);

  const showCustomAlert = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' = 'success',
    onConfirm?: () => void
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertOnConfirm(() => onConfirm);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (params.transactionData) {
      try {
        const parsedData = JSON.parse(params.transactionData) as TransactionItemData;
        if (parsedData.dateObject && typeof parsedData.dateObject === 'string') {
          parsedData.dateObject = new Date(parsedData.dateObject);
        }
        setTransaction(parsedData);
        setUiTransactionType(parsedData.type);
        setDate(new Date(parsedData.dateObject));
        setAmount(String(Math.abs(parsedData.amountRaw)));
        setDetail(parsedData.detail || '');
        setName(parsedData.title || '');

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
        showCustomAlert(
          "Error", 
          "Could not load transaction data for editing.",
          'error',
          () => router.back()
        );
      }
    } else if (params.id) {
      showCustomAlert(
        "Error", 
        "Transaction data not provided directly. Please ensure data is passed.",
        'error',
        () => router.back()
      );
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
        showCustomAlert("Error", "Transaction data is missing. Cannot update.", 'error');
        return;
    }

    if (uiTransactionType === 'expense' && !selectedCategory) {
      showCustomAlert("Validation Error", "Please select a category for your expense.", 'warning');
      return;
    }
    if (!amount) {
      showCustomAlert("Validation Error", "Please enter an amount.", 'warning');
      return;
    }
    if (!name.trim()) {
      showCustomAlert("Validation Error", "Please enter a transaction name.", 'warning');
      return;
    }

    Keyboard.dismiss();
    setIsUpdating(true);

    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showCustomAlert("Invalid Amount", "Please enter a valid positive amount.", 'error');
      setIsUpdating(false);
      return;
    }

    const apiType: ApiTransactionType = uiTransactionType === 'income' ?
      'income' :
      selectedCategory!.id as ApiTransactionType;

    const payload: UpdateTransactionData = {
      name: name.trim(),
      type: apiType,
      amount: numericAmount,
      detail: detail,
      date: date.toISOString(),
    };

    console.log('Updating Transaction with ID:', transaction.id, 'Payload:', payload);

    const response = await updateTransaction(transaction.id, payload);

    setIsUpdating(false);

    if (response.success && response.data) {
      // Create updated transaction data for the detail screen
      const updatedTransaction: TransactionItemData = {
        ...transaction,
        title: name.trim(),
        detail: detail,
        dateObject: date,
        amountRaw: uiTransactionType === 'income' ? numericAmount : -numericAmount,
        type: uiTransactionType,
        originalApiType: apiType,
        categoryDisplay: uiTransactionType === 'income' ? 'Income' : (selectedCategory?.name || 'Other'),
      };

      showCustomAlert(
        "Success", 
        "Transaction updated successfully!",
        'success',
        () => {
          // Navigate back to detail screen with updated data
          router.replace({
            pathname: "/transaction/[id]",
            params: { 
              id: transaction.id, 
              transactionData: JSON.stringify(updatedTransaction) 
            },
          });
        }
      );
    } else {
      showCustomAlert(
        "Update Failed", 
        response.message || response.error || "Could not update transaction.",
        'error'
      );
    }
  };

  const handleCategorySelectFromModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);
  };

  if (!transaction) {
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
                  setSelectedCategory(null);
                }}
              />
              <DateField
                label="Date"
                date={date}
                onDateChange={setDate}
                required
              />
              <FormInput
                label="Title"
                value={name}
                onChangeText={setName}
                placeholder="Enter transaction name..."
                required
                autoCapitalize="words"
              />
              {uiTransactionType === 'expense' && (
                <CategorySelector
                  label="Category"
                  selectedCategory={selectedCategory}
                  onOpenModal={() => setCategoryModalVisible(true)}
                  suggestedCategories={categoriesData.suggestedCategoriesData}
                  onSuggestedSelect={setSelectedCategory}
                  required
                />
              )}
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
                  !name.trim() ||
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
          />
        </View>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttons={[
          {
            text: 'OK',
            onPress: () => {
              setAlertVisible(false);
              if (alertOnConfirm) {
                alertOnConfirm();
              }
            },
            style: alertType === 'error' ? 'destructive' : 'primary'
          }
        ]}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

export default EditTransactionScreen;