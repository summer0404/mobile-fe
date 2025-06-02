import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useRouter, useFocusEffect } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

// Keep the splash screen visible while we fetch initial data
SplashScreen.preventAutoHideAsync();

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

// Target Setup Modal Component
const TargetSetupModal = ({ visible, onClose, onGoToProfile }: {
  visible: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 340,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}>
          {/* Icon */}
          <View style={{
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#f3f4f6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <MaterialCommunityIcons name="target" size={40} color="#7c3aed" />
            </View>
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#1f2937',
            marginBottom: 8,
            fontFamily: 'Poppins-SemiBold',
          }}>
            Set Your Monthly Target
          </Text>

          {/* Description */}
          <Text style={{
            fontSize: 14,
            textAlign: 'center',
            color: '#6b7280',
            lineHeight: 20,
            marginBottom: 24,
            fontFamily: 'Poppins-Regular',
          }}>
            Setting a monthly spending target helps you track your expenses and stay within budget. Let's set one up for better financial management!
          </Text>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#d1d5db',
                backgroundColor: 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#6b7280',
                fontWeight: '600',
                fontSize: 14,
                fontFamily: 'Poppins-Medium',
              }}>
                Later
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGoToProfile}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#7c3aed',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 14,
                fontFamily: 'Poppins-Medium',
              }}>
                Set Target
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Home = () => {
  const filters = ['Daily', 'Weekly', 'Monthly'];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
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

  // Track if initial critical data has loaded
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // Target Setup Modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [hasShownTargetModal, setHasShownTargetModal] = useState(false);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch User information
  useEffect(() => {
    const fetchUserId = async () => {
      setIsLoadingUserId(true);
      try {
        const response = await getMe();
        if (response.success && response.data?.id) {
          setCurrentUserId(response.data.id);
          setFirstName(response.data.firstName || '');
          setLastName(response.data.lastName || '');
          const userTarget = Number(response.data.target) || 0;
          setTarget(userTarget);
        } else {
          console.error("Home: Failed to fetch user Info:", response.message || response.error);
        }
      } catch (error) {
        console.error("Home: Error fetching user:", error);
      } finally {
        setIsLoadingUserId(false);
      }
    };
    fetchUserId();
  }, [router]);

  // Show target modal when target is 0 and data is loaded
  useEffect(() => {
    if (!isLoadingUserId && target === 0 && !hasShownTargetModal && isInitialDataLoaded) {
      // Small delay to ensure the UI is fully rendered
      const timer = setTimeout(() => {
        setShowTargetModal(true);
        setHasShownTargetModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoadingUserId, target, hasShownTargetModal, isInitialDataLoaded]);

  // Fetch Home Transactions (ensure we get 10 non-lend/borrow transactions)
  const fetchHomeTransactions = useCallback(async () => {
    if (!currentUserId) {
      setHomeApiTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    setIsLoadingTransactions(true);
    setTransactionsError(null);

    try {
      const targetCount = 10; // We want 10 non-lend/borrow transactions
      const maxAttempts = 3; // Prevent infinite loops
      let allFetchedTransactions: ApiTransaction[] = [];
      let filteredTransactions: ApiTransaction[] = [];
      let currentLimit = 15; // Start with more than 10 to account for filtering
      let attempts = 0;

      while (filteredTransactions.length < targetCount && attempts < maxAttempts) {
        attempts++;

        const params: GetAllTransactionsParams = {
          limit: currentLimit,
          sort: 'date:desc',
        };

        const response = await getAllTransactions(params);

        if (!response.success || !response.data?.items) {
          throw new Error(response.message || response.error || "Failed to fetch transactions");
        }

        const fetchedTransactions = response.data.items as ApiTransaction[];

        // Filter out lend/borrow transactions
        const validTransactions = fetchedTransactions.filter(
          transaction => transaction.type !== 'borrow' && transaction.type !== 'lend'
        );

        // Remove duplicates (in case of overlapping fetches)
        const newTransactions = validTransactions.filter(
          newTx => !allFetchedTransactions.some(existingTx => existingTx.id === newTx.id)
        );

        allFetchedTransactions = [...allFetchedTransactions, ...newTransactions];
        filteredTransactions = allFetchedTransactions.slice(0, targetCount);

        // If we have enough transactions or the API returned fewer than requested (end of data)
        if (filteredTransactions.length >= targetCount || fetchedTransactions.length < currentLimit) {
          break;
        }

        // Increase limit for next attempt to get more transactions
        currentLimit += 10;
      }

      setHomeApiTransactions(filteredTransactions);

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
        limit: 10000,
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
        limit: 10000,
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

  // Add a function to refresh user data
  const refreshUserData = useCallback(async () => {
    setIsLoadingUserId(true);
    try {
      const response = await getMe();
      if (response.success && response.data?.id) {
        setCurrentUserId(response.data.id);
        setFirstName(response.data.firstName || '');
        setLastName(response.data.lastName || '');
        const userTarget = Number(response.data.target) || 0;
        setTarget(userTarget);
      }
    } catch (error) {
      console.error("Home: Error fetching user:", error);
    } finally {
      setIsLoadingUserId(false);
    }
  }, []);

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    if (!currentUserId) return;

    // Clear any existing errors
    setTransactionsError(null);
    setOverviewDataError(null);
    setDebtDataError(null);

    // Fetch all data concurrently, including updated user data
    await Promise.all([
      refreshUserData(),
      fetchHomeTransactions(),
      fetchFinancialOverview(),
      fetchDebtDataAndCalculatePercentage(),
    ]);
  }, [currentUserId, refreshUserData, fetchHomeTransactions, fetchFinancialOverview, fetchDebtDataAndCalculatePercentage]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshAllData]);

  // Hide splash screen when essential data is loaded
  useEffect(() => {
    const checkIfDataLoaded = async () => {
      // Wait for user data and at least one of the main data fetches to complete
      const userLoaded = !isLoadingUserId;
      const hasAttemptedDataFetch = !isLoadingTransactions && !isLoadingOverviewData && !isLoadingDebtData;

      if (userLoaded && hasAttemptedDataFetch && !isInitialDataLoaded) {
        setIsInitialDataLoaded(true);
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Error hiding splash screen:', error);
        }
      }
    };

    checkIfDataLoaded();
  }, [isLoadingUserId, isLoadingTransactions, isLoadingOverviewData, isLoadingDebtData, isInitialDataLoaded]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        refreshAllData();
      }
    }, [currentUserId, refreshAllData])
  );

  const displayedHomeTransactions: HomeTransactionListItem[] = useMemo(() => {
    if (!Array.isArray(homeApiTransactions)) {
      return [];
    }
    return homeApiTransactions
      .filter(transaction => transaction.type !== 'borrow' && transaction.type !== 'lend')
      .map(mapApiTransactionToHomeListItem);
  }, [homeApiTransactions]);

  const handleGoToAllTransactions = () => {
    router.push('/transaction');
  };

  const handleGoToProfile = () => {
    setShowTargetModal(false);
    router.push('/profile/edit');
  };

  const handleCloseModal = () => {
    setShowTargetModal(false);
  };

  // Don't render anything until splash is hidden
  if (!isInitialDataLoaded) {
    return null;
  }

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed']} // Android
            tintColor="#ffffff" // iOS
            title="Pull to refresh" // iOS
            titleColor="#ffffff" // iOS
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom  // Add bottom padding for tab bar
        }}
      >
        <View className="p-6">
          <HomeHeader firstName={firstName} lastName={lastName} />
          <HomeOverview target={target === null ? undefined : target} onTargetUpdate={setTarget} />
        </View>
        <View className="bg-primary-200 rounded-t-[50] mt-5 px-6 pt-8" style={{
          paddingBottom: insets.bottom + 60 // 32 is py-8 (8 * 4 = 32px)
        }}>
          {isLoadingOverviewData || isLoadingDebtData ? (
            <ActivityIndicator size="small" color="#1A1A2E" className="my-4 h-20" />
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
              debtPercentage={debtPaidPercentage}
            />
          )}

          <TouchableOpacity
            onPress={handleGoToAllTransactions}
            className="bg-primary py-3 px-4 rounded-lg my-4 flex-row justify-center items-center shadow-md"
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="white" />
            <Text className="text-white font-psemibold ml-2">View All Transactions</Text>
          </TouchableOpacity>

          {isLoadingTransactions ? (
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

      {/* Target Setup Modal */}
      <TargetSetupModal
        visible={showTargetModal}
        onClose={handleCloseModal}
        onGoToProfile={handleGoToProfile}
      />
    </SafeAreaView>
  )
}

export default Home