import React, { useState } from 'react'; // Added useState
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import numeral from 'numeral';
import { TransactionItemData } from '@/components/addTransaction/types';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import { deleteTransaction } from '@/services/transactionsService';

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
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation

  let transaction: TransactionItemData | null = null;
  let errorLoadingData = false;

  if (params.transactionData) {
    try {
      const parsedData = JSON.parse(params.transactionData);
      // Ensure dateObject is a Date instance if it was stringified
      if (parsedData.dateObject && typeof parsedData.dateObject === 'string') {
        parsedData.dateObject = new Date(parsedData.dateObject);
      }
      // Basic validation for essential fields (optional but good practice)
      if (!parsedData.id || !parsedData.title || parsedData.amountRaw === undefined || !parsedData.dateObject) {
          console.error("Parsed transaction data is missing essential fields:", parsedData);
          errorLoadingData = true;
      } else {
        transaction = parsedData as TransactionItemData;
      }
    } catch (e) {
      console.error("Failed to parse transactionData param:", e);
      errorLoadingData = true;
    }
  } else {
    // If transactionData is not provided, it's an error for the final product
    console.error("Transaction data not provided via navigation params.");
    errorLoadingData = true;
  }

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

  // Proceed with rendering if transaction data is valid
  const formattedAmount = numeral(transaction.amountRaw).format('$0,0.00');
  const formattedDate = transaction.dateObject.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEdit = () => {
    if (transaction) {
      router.push({
        pathname: "/transaction/edit/[id]",
        params: { id: transaction.id, transactionData: JSON.stringify(transaction) },
      });
    }
  };

  const handleDelete = () => {
    // Ensure transaction is not null before trying to access its id
    if (!transaction) {
        Alert.alert("Error", "Transaction data is not available.");
        return;
    }
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!transaction) return; // Double check, though outer check should suffice
            setIsDeleting(true);
            console.log('Attempting to delete transaction:', transaction.id);
            
            const response = await deleteTransaction(transaction.id);
            setIsDeleting(false);

            if (response.success) {
              Alert.alert("Success", "Transaction deleted successfully.");
              router.back(); // Navigate back to the previous screen
            } else {
              Alert.alert("Delete Failed", response.message || response.error || "Could not delete transaction.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <GoBackToHomeHeader title='Transaction Detail' />

      <View className="flex-1 bg-primary-200 rounded-t-[30px] pt-8">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <Text className="text-base font-pmedium text-black capitalize">
              {transaction.type}
            </Text>
            <Text className={`text-4xl font-pbold mt-1 ${
                transaction.type === 'income' ? 'text-green-500' : 'text-red-500' // Consistent with other screens
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
        <View className="px-6 pb-4 pt-2  flex-row justify-around items-center">
          <TouchableOpacity
            onPress={handleEdit}
            className="bg-primary flex-1 py-3.5 rounded-full items-center mr-2 shadow"
            disabled={isDeleting} // Disable edit button while deleting
          >
            <Text className="text-white font-psemibold text-base">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className={`bg-red-600 flex-1 py-3.5 rounded-full items-center ml-2 shadow ${isDeleting ? 'opacity-50' : ''}`}
            disabled={isDeleting} // Disable delete button while deleting
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-psemibold text-base">Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransactionDetailScreen;