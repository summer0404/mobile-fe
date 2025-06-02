import { View, Text, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native'
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
import CustomAlert, { AlertButton } from '@/components/Alert';

const AddTransaction = () => {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<LocalTransactionTypeId>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [transactionNameInput, setTransactionNameInput] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);
  const navigation = useNavigation();

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttons: AlertButton[] = []
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons);
    setAlertVisible(true);
  };

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
        showCustomAlert(
          "Error",
          "Could not fetch user information. Please try logging in again.",
          'error',
          [
            {
              text: 'OK',
              onPress: () => setAlertVisible(false),
              style: 'primary'
            }
          ]
        );
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
      showCustomAlert(
        "Error",
        "User information is not available. Cannot save transaction.",
        'error',
        [
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
            style: 'primary'
          }
        ]
      );
      return;
    }

    // Validation for new name field
    if (!transactionNameInput.trim()) {
      showCustomAlert(
        "Validation Error",
        "Transaction name is required.",
        'warning',
        [
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
            style: 'primary'
          }
        ]
      );
      return;
    }

    if (!amount || (transactionType !== 'income' && !selectedCategory)) {
      showCustomAlert(
        "Validation Error",
        "Please fill in all required fields (Amount and Category for expenses).",
        'warning',
        [
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
            style: 'primary'
          }
        ]
      );
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    let apiType: ApiTransactionType;
    if (transactionType === 'income') {
      apiType = 'income';
    } else if (selectedCategory?.id) {
      apiType = selectedCategory.id as ApiTransactionType;
    } else {
      showCustomAlert(
        "Error",
        "Category type is missing for expense.",
        'error',
        [
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
            style: 'primary'
          }
        ]
      );
      setIsSaving(false);
      return;
    }

    const transactionData: CreateTransactionData = {
      name: transactionNameInput.trim(),
      type: apiType,
      amount: parseFloat(amount.replace(/,/g, '')),
      detail: message.trim() || null,
      date: date.toISOString(),
    };

    console.log('Attempting to save transaction with data:', transactionData);

    try {
      const response = await createTransaction(transactionData);
      setIsSaving(false);

      if (response.success && response.data) {
        Keyboard.dismiss();
        showCustomAlert(
          "Success",
          response.message || "Transaction saved successfully!",
          'success',
          [
            {
              text: 'OK',
              onPress: () => {
                setAlertVisible(false);
                // Reset form
                setAmount('');
                setTransactionNameInput('');
                setMessage('');
                setSelectedCategory(null);
                setDate(new Date());
                setTransactionType('expense');
                router.replace('/transaction');
              },
              style: 'primary'
            }
          ]
        );
      } else {
        showCustomAlert(
          "Error Saving Transaction",
          response.message || response.error || "Could not save transaction. Please try again.",
          'error',
          [
            {
              text: 'OK',
              onPress: () => setAlertVisible(false),
              style: 'primary'
            }
          ]
        );
      }
    } catch (error) {
      setIsSaving(false);
      console.error("Save transaction error:", error);
      showCustomAlert(
        "Error",
        "An unexpected error occurred while saving the transaction.",
        'error',
        [
          {
            text: 'OK',
            onPress: () => setAlertVisible(false),
            style: 'primary'
          }
        ]
      );
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
              <FormInput
                label="Transaction Name"
                value={transactionNameInput}
                onChangeText={setTransactionNameInput}
                placeholder="Short name for the transaction"
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
              />
              <FormInput
                label="Note (Optional)"
                value={message}
                onChangeText={setMessage}
                placeholder="Enter any additional details..."
                multiline
                numberOfLines={3}
                inputWrapperStyle="h-24 items-start"
              />
              <PrimaryButton
                title={isSaving ? "Saving..." : "Save"}
                onPress={handleSave}
                disabled={
                  isLoadingUserId ||
                  isSaving ||
                  !transactionNameInput.trim() ||
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

      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttons={alertButtons}
        onDismiss={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AddTransaction;
