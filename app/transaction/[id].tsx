import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import numeral from 'numeral';
import { TransactionItemData } from '@/components/addTransaction/types';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import { deleteTransaction } from '@/services/transactionsService';
import CustomAlert from '@/components/Alert';

interface DetailItemProps {
  label: string;
  value: string | undefined;
  isLongText?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, isLongText = false }) => (
  <View className="mb-5">
    <Text className="text-sm font-pmedium text-black/70 mb-1.5">{label}</Text>
    <View className={`bg-white p-3.5 rounded-xl shadow-sm ${isLongText ? 'min-h-[60px]' : ''}`}>
      <Text className="text-base text-black">{value || 'N/A'}</Text>
    </View>
  </View>
);

const TransactionDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; transactionData?: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [transaction, setTransaction] = useState<TransactionItemData | null>(null);
  const [errorLoadingData, setErrorLoadingData] = useState(false);

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [alertButtons, setAlertButtons] = useState<Array<{
    text: string;
    onPress: () => void;
    style?: 'primary' | 'secondary' | 'destructive';
  }>>([]);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'primary' | 'secondary' | 'destructive';
    }> = []
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons);
    setAlertVisible(true);
  };

  // Load transaction data whenever params change
  useEffect(() => {
    if (params.transactionData) {
      try {
        const parsedData = JSON.parse(params.transactionData);
        if (parsedData.dateObject && typeof parsedData.dateObject === 'string') {
          parsedData.dateObject = new Date(parsedData.dateObject);
        }
        if (!parsedData.id || !parsedData.title || parsedData.amountRaw === undefined || !parsedData.dateObject) {
          console.error("Parsed transaction data is missing essential fields:", parsedData);
          setErrorLoadingData(true);
          setTransaction(null);
        } else {
          setTransaction(parsedData as TransactionItemData);
          setErrorLoadingData(false);
        }
      } catch (e) {
        console.error("Failed to parse transactionData param:", e);
        setErrorLoadingData(true);
        setTransaction(null);
      }
    } else {
      console.error("Transaction data not provided via navigation params.");
      setErrorLoadingData(true);
      setTransaction(null);
    }
  }, [params.transactionData]);

  if (errorLoadingData || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center p-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-white text-lg text-center mb-4">
          {errorLoadingData ? "Could not load transaction details." : "Transaction not found."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-accent py-3 px-6 rounded-lg">
          <Text className="text-white font-psemibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedDate = transaction.dateObject.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEdit = () => {
    if (transaction) {
      router.replace({
        pathname: "/transaction/edit/[id]",
        params: { id: transaction.id, transactionData: JSON.stringify(transaction) },
      });
    }
  };

  const handleDelete = () => {
    if (!transaction) {
      showCustomAlert(
        "Error",
        "Transaction data is not available.",
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

    showCustomAlert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      'warning',
      [
        {
          text: 'Cancel',
          onPress: () => setAlertVisible(false),
          style: 'secondary'
        },
        {
          text: 'Delete',
          onPress: async () => {
            setAlertVisible(false);
            if (!transaction) return;

            setIsDeleting(true);
            console.log('Attempting to delete transaction:', transaction.id);

            const response = await deleteTransaction(transaction.id);
            setIsDeleting(false);

            if (response.success) {
              showCustomAlert(
                "Success",
                "Transaction deleted successfully.",
                'success',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setAlertVisible(false);
                      router.back();
                    },
                    style: 'primary'
                  }
                ]
              );
            } else {
              showCustomAlert(
                "Delete Failed",
                response.message || response.error || "Could not delete transaction.",
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
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* <Stack.Screen options={{ headerShown: false }} /> */}
      <StatusBar />
      <View className="p-6">
        <GoBackToHomeHeader title='Transaction Detail' />
      </View>
      <View className="flex-1 bg-primary-200 rounded-t-[30px] pt-8">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <Text className="text-base font-pmedium text-black capitalize">
              {transaction.type}
            </Text>
            <Text className={`text-4xl font-pbold mt-1 ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
              }`}>
              {transaction.amountRaw >= 0 ? '+' : '-'}{numeral(Math.abs(transaction.amountRaw)).format('$0,0.00')}
            </Text>
          </View>

          <DetailItem label="Title" value={transaction.title} />
          <DetailItem label="Detail" value={transaction.detail} isLongText={!!transaction.detail && transaction.detail.length > 50} />
          <DetailItem label="Transaction Date" value={formattedDate} />
          <DetailItem label="Category" value={transaction.categoryDisplay} />
        </ScrollView>
      </View>

      <View className="absolute bottom-0 left-0 right-0">
        <View className="px-6 pb-4 pt-2 flex-row justify-around items-center">
          <TouchableOpacity
            onPress={handleEdit}
            className="bg-primary flex-1 py-3.5 rounded-full items-center mr-2 shadow"
            disabled={isDeleting}
          >
            <Text className="text-white font-psemibold text-base">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className={`bg-red-600 flex-1 py-3.5 rounded-full items-center ml-2 shadow ${isDeleting ? 'opacity-50' : ''}`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-psemibold text-base">Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

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

export default TransactionDetailScreen;