// app/transactionDetail.tsx (or app/transaction/[id].tsx)
import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; // Import hooks
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; // For icons
import numeral from 'numeral'; // For formatting amount
import { TransactionItemData } from '@/components/addTransaction/types';
import dummyTransactions from '@/constants/dummyTransactions';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';


interface DetailItemProps {
  label: string;
  value: string | undefined;
  isLongText?: boolean;
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value, isLongText = false }) => (
  <View className="mb-5">
    <Text className="text-sm font-medium text-black/70 mb-1.5">{label}</Text>
    <View className={`bg-white p-3.5 rounded-xl shadow-sm ${isLongText ? 'min-h-[60px]' : ''}`}>
      <Text className="text-base text-black">{value || 'N/A'}</Text>
    </View>
  </View>
);


const TransactionDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; transactionData?: string }>(); // Get params

  let transaction: TransactionItemData | null = null;
  if (params.transactionData) {
    try {
      const parsedData = JSON.parse(params.transactionData);
      // Ensure dateObject is a Date instance if it was stringified
      if (parsedData.dateObject && typeof parsedData.dateObject === 'string') {
        parsedData.dateObject = new Date(parsedData.dateObject);
      }
      transaction = parsedData as TransactionItemData;
    } catch (e) {
      console.error("Failed to parse transactionData param:", e);
    }
  } else if (params.id) {
    transaction = dummyTransactions.find(t => t.id === params.id) || null;
    if (!transaction) {
        console.log(`Transaction with ID "${params.id}" not found in dummyTransactions.`);
    }
  } else {
    // Fallback if no ID or data is passed, try to find "123" or use the first dummy transaction
    transaction = dummyTransactions.find(t => t.id === "123") || dummyTransactions[0] || null;
    if (!transaction) {
        console.log("No fallback transaction found in dummyTransactions.");
    }
  }


  if (!transaction) {
    // Handle case where transaction is not found or data is invalid
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-white text-lg">Transaction not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-accent p-3 rounded-lg">
            <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedAmount = numeral(transaction.amountRaw).format('$0,0.00'); // Use amountRaw
  const formattedDate = transaction.dateObject.toLocaleDateString('en-US', { // Use dateObject
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleEdit = () => {
    // Navigate to an edit screen, passing the transaction ID or data
    router.push({
      pathname: '/transaction/[id]',
      params: { id: transaction!.id },
    });
    console.log('Edit transaction:', transaction.id);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log('Delete transaction:', transaction.id);
            router.back();
          },
        },
      ]
    );
  };


  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Stack.Screen options={{ headerShown: false }} /> {/* Hide default header */}
      <StatusBar barStyle="light-content" />

      <GoBackToHomeHeader title='Transaction Detail' />

      {/* Main Content Area */}
      <View className="flex-1 bg-primary-200 rounded-t-[30px] pt-8">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }} // Space for buttons and nav
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Display */}
          <View className="items-center mb-8">
            <Text className="text-base font-medium text-black capitalize">
              {transaction.type}
            </Text>
            <Text className={`text-4xl font-bold mt-1 ${
                transaction.type === 'income' ? 'text-green-500' : 'text-yellow-500' // Or your expense color
            }`}>
              {transaction.type === 'income' ? '+' : ''}{formattedAmount}
            </Text>
          </View>

          {/* Detail Items */}
          <DetailItem label="Detail" value={transaction.detail} isLongText={!!transaction.detail && transaction.detail.length > 50} />
          <DetailItem label="Transaction Date" value={formattedDate} />
          <DetailItem label="Category" value={transaction.categoryDisplay} /> {/* Use categoryDisplay */}
          {/* Add more DetailItem components for other fields if needed */}

        </ScrollView>
      </View>

      {/* Action Buttons & Bottom Nav Container */}
      <View className="absolute bottom-0 left-0 right-0">
        {/* Edit/Delete Buttons */}
        <View className="px-6 pb-4 pt-2  flex-row justify-around items-center">
          <TouchableOpacity
            onPress={handleEdit}
            className="bg-primary flex-1 py-3.5 rounded-full items-center mr-2 shadow"
          >
            <Text className="text-white font-semibold text-base">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-primary flex-1 py-3.5 rounded-full items-center ml-2 shadow" // Or a different color for delete
          >
            <Text className="text-white font-semibold text-base">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransactionDetailScreen;