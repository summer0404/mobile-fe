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
import { handleFetchDebts } from '@/controller/DebtController'

// Define a more specific type for your debt items if not already globally available
interface DebtItem {
  id: number | string;
  debtorName: string;
  dueDate: string; 
  status: 'pending' | 'paid' | 'overdue';
  transaction: { 
    date: string;
    type: 'lend' | 'borrow' | string; 
    name: string;
    amount: string; 
    detail?: string;
  };
}


const Home = () => {
  const filters = ['Daily', 'Weekly', 'Monthly'];
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

  // State for Debt Data
  const [debtData, setDebtData] = useState<DebtItem[]>([]);
  const [isLoadingDebtData, setIsLoadingDebtData] = useState(false);
  const [debtDataError, setDebtDataError] = useState<string | null>(null);
  const [debtPaidPercentage, setDebtPaidPercentage] = useState(0);


  // Fetch User information
  useEffect(() => {
    const fetchUserId = async () => {
      setIsLoadingUserId(true);
      const response = await getMe();
      if (response.success && response.data?.id) {
        setCurrentUserId(response.data.id);
        setFirstName(response.data.firstName || ''); // Ensure fallback for potentially null/undefined
        setLastName(response.data.lastName || '');  // Ensure fallback
      } else {
        console.error("Home: Failed to fetch user Info:", response.message || response.error);
        // Optionally, handle navigation to login if user fetch fails critically
        // router.replace('/auth/signIn');
      }
      setIsLoadingUserId(false);
    };
    fetchUserId();
  }, [router]); // Added router to dependency array

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

    try {
      const response = await getAllTransactions(params);
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
    } catch (error: any) {
        console.error("Home: Error fetching home transactions:", error);
        setTransactionsError("Could not load recent transactions.");
        setHomeApiTransactions([]);
    } finally {
        setIsLoadingTransactions(false);
    }
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

    const today = new Date();
    const currentDayOfWeek = today.getDay();
    let daysToSubtract = currentDayOfWeek - 1;
    if (currentDayOfWeek === 0) {
      daysToSubtract = 6;
    }
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() - daysToSubtract);
    mondayDate.setHours(0, 0, 0, 0);
    const mondayTimestamp = mondayDate.getTime();

    try {
      const incomeParams: GetAllTransactionsParams = {
        type: 'income',
        limit: 10000, // Consider if a smaller limit or date range is more appropriate
        createFrom: mondayTimestamp.toString(),
      };
      const incomeResponse = await getAllTransactions(incomeParams);

      if (!incomeResponse.success) {
  
        console.warn("Home: Failed to fetch income for overview:", incomeResponse.message || incomeResponse.error);
      } else if (incomeResponse.data?.items) {
        calculatedRevenue = incomeResponse.data.items.reduce((sum, transaction) => {
          return sum + parseFloat(String(transaction.amount) || '0');
        }, 0);
      }

      const foodParams: GetAllTransactionsParams = {
        type: 'food',
        limit: 10000, // Consider if a smaller limit or date range is more appropriate
      };
      const foodResponse = await getAllTransactions(foodParams);

      if (!foodResponse.success) {
        console.warn("Home: Failed to fetch food expenses for overview:", foodResponse.message || foodResponse.error);
      } else if (foodResponse.data?.items) {
        calculatedFoodExpense = foodResponse.data.items.reduce((sum, transaction) => {
          return sum + Math.abs(parseFloat(String(transaction.amount) || '0'));
        }, 0);
      }
      
      setRevenue(calculatedRevenue);
      setFoodExpense(calculatedFoodExpense);

    } catch (error: any) {
      console.error("Home: Error fetching financial overview data:", error);
      setOverviewDataError("Could not load financial overview.");
      setRevenue(0); 
      setFoodExpense(0);
    } finally {
      setIsLoadingOverviewData(false);
    }
  }, [currentUserId, router]);


  // Fetch Debt Data and Calculate Percentage
  const fetchDebtDataAndCalculatePercentage = useCallback(async () => {
    if (!currentUserId) {
      setDebtData([]);
      setDebtPaidPercentage(0);
      setIsLoadingDebtData(false);
      return;
    }

    setIsLoadingDebtData(true);
    setDebtDataError(null);

    try {
      const response = await handleFetchDebts();
      if (response && response.items && Array.isArray(response.items)) {
        const allDebts: DebtItem[] = response.items;
        setDebtData(allDebts);
        const borrowDebts = allDebts.filter(debt => debt.transaction?.type === 'borrow');

        const sumPaidBorrowDebtsAmount = borrowDebts
          .filter(debt => debt.status === 'paid')
          .reduce((sum, debt) => sum + parseFloat(debt.transaction?.amount || '0'), 0);

        const sumPendingBorrowDebtsAmount = borrowDebts
          .filter(debt => debt.status === 'pending')
          .reduce((sum, debt) => sum + parseFloat(debt.transaction?.amount || '0'), 0);
        
        const totalRelevantBorrowDebtsAmount = sumPaidBorrowDebtsAmount + sumPendingBorrowDebtsAmount;

        if (totalRelevantBorrowDebtsAmount > 0) {
          const percentage = (sumPaidBorrowDebtsAmount / totalRelevantBorrowDebtsAmount) * 100;
          setDebtPaidPercentage(Math.round(percentage)); 
        } else {
          setDebtPaidPercentage(100);
        }

      } else {
        console.warn("Home: Unexpected data format for debts:", response);
        setDebtData([]);
        setDebtPaidPercentage(0);
        setDebtDataError("Unexpected data format for debts.");
      }
    } catch (error: any) {
      if (error.message === "Session expired. Please log in" || error.status === 401) {
        router.replace('/auth/signIn');
        return;
      }
      console.error("Home: Error fetching debt data:", error);
      setDebtDataError("Could not load debt data.");
      setDebtData([]);
      setDebtPaidPercentage(0);
    } finally {
      setIsLoadingDebtData(false);
    }
  }, [currentUserId, router]);


  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchHomeTransactions();
        fetchFinancialOverview();
        fetchDebtDataAndCalculatePercentage(); // Fetch debt data
      }
    }, [currentUserId, fetchHomeTransactions, fetchFinancialOverview, fetchDebtDataAndCalculatePercentage])
  );

  const displayedHomeTransactions: HomeTransactionListItem[] = useMemo(() => {
    if (!Array.isArray(homeApiTransactions)) {
      return [];
    }
    // Filter out 'borrow' and 'lend' types before mapping
    return homeApiTransactions
      .filter(transaction => transaction.type !== 'borrow' && transaction.type !== 'lend')
      .map(mapApiTransactionToHomeListItem);
  }, [homeApiTransactions]);

  const handleGoToAllTransactions = () => {
    router.push('/transaction');
  };

  // Combine loading states for a general "loading content" indicator if preferred
  const isPageLoading = isLoadingUserId || isLoadingTransactions || isLoadingOverviewData || isLoadingDebtData;

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar />
      <ScrollView>
        <View className="p-6">
          <HomeHeader firstName={firstName} lastName={lastName}/>
          <HomeOverview />
        </View>
        <View className="bg-primary-200 rounded-t-[50] mt-5 px-6 py-8 min-h-screen ">
          {isLoadingOverviewData || isLoadingDebtData ? ( // Show loader for this specific component's data
            <ActivityIndicator size="small" color="#1A1A2E" className="my-4 h-20" /> // Added h-20 for placeholder height
          ) : overviewDataError || debtDataError ? (
            <View className="my-4 p-3 bg-red-100 rounded-lg h-20 items-center justify-center">
                <Text className="text-red-600 text-center text-xs">
                    {overviewDataError || debtDataError || "Error loading overview."}
                </Text>
            </View>
          ) : (
            <HomeOverview2 
              revenue={revenue} 
              food={foodExpense} 
              debtPercentage={debtPaidPercentage} // Pass the calculated percentage
            />
          )}
          {/* <FilterButtons filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} /> */}

          <TouchableOpacity
            onPress={handleGoToAllTransactions}
            className="bg-primary py-3 px-4 rounded-lg my-4 flex-row justify-center items-center shadow-md"
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="white" />
            <Text className="text-white font-psemibold ml-2">View All Transactions</Text>
          </TouchableOpacity>

          {isLoadingTransactions ? ( // Keep specific loader for transaction list
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