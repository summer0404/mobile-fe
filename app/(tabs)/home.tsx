import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useRouter, useFocusEffect } from 'expo-router'
import HomeHeader from '../../components/HomeHeader'
import HomeOverview from '@/components/HomeOverview'
import HomeOverview2 from '@/components/HomeOverview2'
import FilterButtons from '@/components/FilterButtons'
import HomeTransactionList from '@/components/HomeTransactionList'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getMe } from '@/services/authService'
import { getAllTransactions, Transaction as ApiTransaction, GetAllTransactionsParams, PaginatedTransactionsResponse } from '@/services/transactionsService'
import { mapApiTransactionToHomeListItem, HomeTransactionListItem } from '@/utils/dataTransformers'

const Home = () => {
  const filters = ['Daily', 'Weekly', 'Monthly'] // These filters are not yet used for fetching
  const [activeFilter, setActiveFilter] = useState('daily');
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);

  const [homeApiTransactions, setHomeApiTransactions] = useState<ApiTransaction[]>([]); // This will store items
  // const [homeMeta, setHomeMeta] = useState<PaginatedTransactionsResponse['meta'] | null>(null); // Optional

  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // Fetch User ID
  useEffect(() => {
    const fetchUserId = async () => {
      setIsLoadingUserId(true);
      const response = await getMe();
      if (response.success && response.data?.id) {
        setCurrentUserId(response.data.id);
      } else {
        console.error("Home: Failed to fetch user ID:", response.message || response.error);
        // Optionally show an alert or handle error for user ID fetching
      }
      setIsLoadingUserId(false);
    };
    fetchUserId();
  }, []);

  // Fetch Home Transactions
  const fetchHomeTransactions = useCallback(async () => {
    if (!currentUserId) {
      setHomeApiTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    setTransactionsError(null);

    const params: GetAllTransactionsParams = {
      userId: currentUserId,
      limit: 3, // Get the 3 most recent
      sort: 'date:desc', // Sort by date descending
    };

    const response = await getAllTransactions(params); // response.data will be PaginatedTransactionsResponse
    if (response.success && response.data) {
      if (response.data.items && Array.isArray(response.data.items)) {
        setHomeApiTransactions(response.data.items);
        // if (response.data.meta) { // Optional
        //     setHomeMeta(response.data.meta);
        // }
      } else {
        console.warn("Home: Unexpected data format for home transactions, items missing or not an array:", response.data);
        setHomeApiTransactions([]);
        setTransactionsError("Unexpected data format for home transactions.");
      }
    } else {
      setTransactionsError(response.message || response.error || "Failed to fetch home transactions.");
      setHomeApiTransactions([]);
    }
    setIsLoadingTransactions(false);
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchHomeTransactions();
      }
    }, [currentUserId, fetchHomeTransactions])
  );

  const displayedHomeTransactions: HomeTransactionListItem[] = useMemo(() => {
    if (!Array.isArray(homeApiTransactions)) {
      return [];
    }
    return homeApiTransactions.map(mapApiTransactionToHomeListItem);
  }, [homeApiTransactions]);

  const handleGoToAllTransactions = () => {
    router.push('/transaction');
  };

  // TODO: Fetch actual revenue and food data for HomeOverview2
  const revenue = 4000000; // Placeholder
  const foodExpense = 1000; // Placeholder

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar />
      <ScrollView>
        <View className="p-6">
          <HomeHeader />
          <HomeOverview />
        </View>
        <View className="bg-primary-200 rounded-t-[50] mt-5 px-6 py-8 min-h-screen ">
          <HomeOverview2 revenue={revenue} food={foodExpense} />
          <FilterButtons filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

          <TouchableOpacity
            onPress={handleGoToAllTransactions}
            className="bg-primary py-3 px-4 rounded-lg my-4 flex-row justify-center items-center shadow-md"
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="white" />
            <Text className="text-white font-psemibold ml-2">View All Transactions</Text>
          </TouchableOpacity>

          {isLoadingUserId ? (
            <ActivityIndicator size="small" color="#1A1A2E" className="my-4" />
          ) : isLoadingTransactions ? (
            <ActivityIndicator size="large" color="#1A1A2E" className="my-4" />
          ) : transactionsError ? (
            <View className="my-4 p-4 bg-red-100 rounded-lg">
              <Text className="text-red-700 text-center">Error: {transactionsError}</Text>
              <TouchableOpacity onPress={fetchHomeTransactions} className="mt-2 bg-red-500 p-2 rounded">
                <Text className="text-white text-center font-psemibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : displayedHomeTransactions.length > 0 ? (
            <HomeTransactionList transactions={displayedHomeTransactions} />
          ) : (
            <Text className="text-center text-textMuted my-4">No recent transactions found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home