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
import InitialsAvatar from '@/components/profile/InitialsAvatar'
const Home = () => {
  const filters = ['Daily', 'Weekly', 'Monthly'] // These filters are not yet used for fetching
  const [activeFilter, setActiveFilter] = useState('daily');
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);

  const [homeApiTransactions, setHomeApiTransactions] = useState<ApiTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  // State for HomeOverview2 data
  const [revenue, setRevenue] = useState(0);
  const [foodExpense, setFoodExpense] = useState(0);
  const [isLoadingOverviewData, setIsLoadingOverviewData] = useState(false);
  const [overviewDataError, setOverviewDataError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  // Fetch User information
  useEffect(() => {
    const fetchUserId = async () => {
      setIsLoadingUserId(true);
      const response = await getMe();
      if (response.success && response.data?.id) {
        setCurrentUserId(response.data.id);
        setFirstName(response.data.firstName)
        setLastName(response.data.lastName)
      } else {
        console.error("Home: Failed to fetch user Info:", response.message || response.error);
      }
      setIsLoadingUserId(false);
    };
    fetchUserId();
  }, []);

  // Fetch Home Transactions (recent 3)
  const fetchHomeTransactions = useCallback(async () => {
    if (!currentUserId) {
      setHomeApiTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    setTransactionsError(null);

    const params: GetAllTransactionsParams = {
      limit: 3, // Get the 3 most recent
      sort: 'date:desc', // Sort by date descending
    };

    const response = await getAllTransactions(params); // response.data will be PaginatedTransactionsResponse
    if (response.success && response.data) {
      if (response.data.items && Array.isArray(response.data.items)) {
        setHomeApiTransactions(response.data.items);
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

  // Fetch data for HomeOverview2 (revenue and food expenses)
  const fetchFinancialOverview = useCallback(async () => {
    if (!currentUserId) {
      setRevenue(0);
      setFoodExpense(0);
      return;
    }
    setIsLoadingOverviewData(true);
    setOverviewDataError(null);
    let calculatedRevenue = 0;
    let calculatedFoodExpense = 0;

    // Calculate the date for Monday of the current week
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    let daysToSubtract = currentDayOfWeek - 1;
    if (currentDayOfWeek === 0) { // If it's Sunday
      daysToSubtract = 6; // Go back 6 days to get Monday
    }
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - daysToSubtract);
    mondayDate.setHours(0, 0, 0, 0); // Normalize to the start of the day
    const mondayTimestamp = mondayDate.getTime(); // Get timestamp

    try {
      // Fetch all income transactions from the start of this week
      const incomeParams: GetAllTransactionsParams = {
        type: 'income',
        limit: 10000,
        createFrom: mondayTimestamp.toString(),
      };
      const incomeResponse = await getAllTransactions(incomeParams);

      if (!incomeResponse.success) {
        if (
          (incomeResponse.message === "Session expired. Please log in")
        ) {
          router.replace('/auth/signIn');
          return; // Stop further execution
        }
        console.warn("Home: Failed to fetch income for overview:", incomeResponse.message || incomeResponse.error);
      } else if (incomeResponse.data?.items) {
        calculatedRevenue = incomeResponse.data.items.reduce((sum, transaction) => {
          return sum + parseFloat(String(transaction.amount) || '0');
        }, 0);
      }

      // Fetch all food expense transactions
      const foodParams: GetAllTransactionsParams = {
        type: 'food',
        limit: 10000,
      };
      const foodResponse = await getAllTransactions(foodParams);

      if (!foodResponse.success) {
        if (
          (incomeResponse.message === "Session expired. Please log in")
        ) {
          router.replace('/auth/signIn');
          return; // Stop further execution
        }
        console.warn("Home: Failed to fetch food expenses for overview:", foodResponse.message || foodResponse.error);
      } else if (foodResponse.data?.items) {
        calculatedFoodExpense = foodResponse.data.items.reduce((sum, transaction) => {
          return sum + Math.abs(parseFloat(String(transaction.amount) || '0'));
        }, 0);
      }
      
      setRevenue(calculatedRevenue);
      setFoodExpense(calculatedFoodExpense);

      // if ((!incomeResponse.success || !foodResponse.success) && !overviewDataError) {
      //    // Set a general error if any part failed (and not already handled by a 401 redirect)
      //    // Avoid setting this if a 401 redirect is already in progress or caught
      //    const isNavigating = router.pathname === '/auth/signIn'; // A simple check, might need refinement
      //    if(!isNavigating) setOverviewDataError("Could not load some financial data.");
      // }

    } catch (error: any) {
      if (error.response?.status === 401) {
        router.replace('/auth/signIn');
        return; 
      } else {
        console.error("Home: Error fetching financial overview data:", error);
        setOverviewDataError("Could not load financial overview.");
        setRevenue(0); 
        setFoodExpense(0);
      }
    } finally {
      setIsLoadingOverviewData(false);
    }
  }, [currentUserId, router]); // Added router to dependencies


  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchHomeTransactions();
        fetchFinancialOverview(); // Fetch overview data as well
      }
    }, [currentUserId, fetchHomeTransactions, fetchFinancialOverview])
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

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar />
      <ScrollView>
        <View className="p-6">
          <HomeHeader firstName={firstName} lastName={lastName}/>
          <HomeOverview />
        </View>
        <View className="bg-primary-200 rounded-t-[50] mt-5 px-6 py-8 min-h-screen ">
          <HomeOverview2 
            revenue={revenue} 
            food={foodExpense} 
          />
          {/* <FilterButtons filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} /> */}

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