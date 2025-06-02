import { View, Text, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ExpenseBar from './ExpenseBar';
import { getMe } from '@/services/authService';
import { getAllTransactions, getAllExpenseTransactions, GetAllTransactionsParams, TransactionType } from '@/services/transactionsService';
import { useFocusEffect, useRouter } from 'expo-router';

// Helper to format currency
const formatCurrency = (amount: number) => {
    // Basic currency formatting, adjust as needed (e.g., for locale, currency symbol)
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    return `${sign}$${absAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Helper to get current month name
const getCurrentMonthName = () => {
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    return months[new Date().getMonth()];
};

// Update HomeOverview to accept target as prop
interface HomeOverviewProps {
  target?: number;
  onTargetUpdate?: (newTarget: number) => void;
}

const HomeOverview: React.FC<HomeOverviewProps> = ({ target: propTarget, onTargetUpdate }) => {
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isLoadingUserId, setIsLoadingUserId] = useState(true);

    const [totalBalance, setTotalBalance] = useState(0);
    const [totalMonthlyIncome, setTotalMonthlyIncome] = useState(0);
    const [totalMonthlyExpenses, setTotalMonthlyExpenses] = useState(0);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Use prop target if available, otherwise fetch it
    const [localTarget, setLocalTarget] = useState(0);
    const target = propTarget !== undefined ? propTarget : localTarget;

    // Fetch User ID (remove target fetching since it's passed as prop)
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoadingUserId(true);
            try {
                const response = await getMe();
                if (response.success && response.data?.id) {
                    setCurrentUserId(response.data.id);
                    // Only set local target if no prop target is provided
                    if (propTarget === undefined) {
                        const userTarget = Number(response.data.target) || 0;
                        setLocalTarget(userTarget);
                        onTargetUpdate?.(userTarget);
                    }
                } else {
                    if ((response as any).status === 401 || response.message?.toLowerCase().includes('unauthorized')) {
                        router.replace('/auth/signIn');
                        return;
                    }
                    setError('Failed to fetch user data.');
                    console.error("HomeOverview: Failed to fetch user ID:", response.message || response.error);
                }
            } catch (e: any) {
                if (e.response?.status === 401) {
                    router.replace('/auth/signIn');
                    return;
                }
                setError('An error occurred while fetching user data.');
                console.error("HomeOverview User Fetch Error:", e);
            } finally {
                setIsLoadingUserId(false);
            }
        };
        fetchUser();
    }, [router, propTarget, onTargetUpdate]);

    const fetchMonthlyOverview = useCallback(async () => {
        if (!currentUserId) return;

        setIsLoadingData(true);
        setError(null);

        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        try {
            const params: GetAllTransactionsParams = {
                createFrom: startDate.getTime().toString(),
                createTo: endDate.getTime().toString(),
                limit: 10000,
            };
            const response = await getAllTransactions(params);

            if (!response.success) {
                if ((response as any).status === 401 || response.message?.toLowerCase().includes('unauthorized')) {
                    router.replace('/auth/signIn');
                    return;
                }
                setError(response.message || response.error || 'Failed to fetch monthly transactions.');
                setTotalMonthlyIncome(0);
                setTotalMonthlyExpenses(0);
                setTotalBalance(0);
                return;
            }

            const transactions = response.data?.items || [];
            let incomeThisMonth = 0;
            let expensesThisMonth = 0;

            transactions.forEach(t => {
                const amount = Math.abs(parseFloat(String(t.amount) || '0'));
                
                if (t.type === 'income') {
                    // Only actual income counts as income
                    incomeThisMonth += amount;
                } else if (t.type !== 'lend' && t.type !== 'borrow') {
                    // All transaction types except income, lend, and borrow are expenses
                    // This includes: food, transportation, entertainment, shopping, etc.
                    expensesThisMonth += amount;
                }
                // Exclude 'lend' and 'borrow' from both income and expense calculations
            });

            setTotalMonthlyIncome(incomeThisMonth);
            setTotalMonthlyExpenses(expensesThisMonth);
            // Net balance = income - expenses (excluding lend/borrow)
            setTotalBalance(incomeThisMonth - expensesThisMonth);

        } catch (e: any) {
            if (e.response?.status === 401) {
                router.replace('/auth/signIn');
                return;
            }
            setError('An error occurred while fetching monthly data.');
            console.error("HomeOverview Data Fetch Error:", e);
            setTotalMonthlyIncome(0);
            setTotalMonthlyExpenses(0);
            setTotalBalance(0);
        } finally {
            setIsLoadingData(false);
        }
    }, [currentUserId, router]);

    useFocusEffect(
        useCallback(() => {
            if (currentUserId) {
                fetchMonthlyOverview();
            }
        }, [currentUserId, fetchMonthlyOverview])
    );

    // Calculate expense percentage based on target (if target exists)
    const expensePercentage = target > 0 ? (totalMonthlyExpenses / target) * 100 : 0;

    if (isLoadingUserId) {
        return (
            <View className="items-center justify-center my-4 h-32">
                <ActivityIndicator size="small" color="white" />
            </View>
        );
    }

    if (error && !isLoadingData) {
        return (
            <View className="items-center justify-center my-4 p-4 bg-red-100 rounded-lg mx-4">
                <Text className="text-red-700 text-center">{error}</Text>
            </View>
        );
    }

    return (
        <>
            {/* Month indicator */}
            <View className="items-center mb-2">
                <Text className="text-sm text-white/80 font-pregular">
                    {getCurrentMonthName()} {new Date().getFullYear()} Overview
                </Text>
            </View>

            <View className="flex-row justify-around items-center my-4">
                <View className="items-center">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="arrow-top-right-bold-box-outline" size={24} color="white" />
                        <Text className="text-xs text-white ml-1 font-pregular">This Month Income</Text>
                    </View>
                    {isLoadingData ? (
                        <ActivityIndicator size="small" color="white" className="mt-1" />
                    ) : (
                        <Text className="text-2xl font-pbold text-white mt-1">{formatCurrency(totalMonthlyIncome)}</Text>
                    )}
                </View>
                <View className="w-px h-12 bg-white/50" />
                <View className="items-center">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="arrow-bottom-left-bold-box-outline" size={24} color="white" />
                        <Text className="text-xs text-white ml-1 font-pregular">This Month Expense</Text>
                    </View>
                    {isLoadingData ? (
                        <ActivityIndicator size="small" color="#FFD700" className="mt-1" />
                    ) : (
                        <Text className="text-2xl font-pbold text-secondary mt-1">{formatCurrency(totalMonthlyExpenses)}</Text>
                    )}
                </View>
            </View>
            {isLoadingData ? (
                <View className="h-5 bg-gray-700 rounded-full mx-4 my-2">
                    <ActivityIndicator size="small" color="white" />
                </View>
            ) : null}
            <ExpenseBar percentage={expensePercentage} amount={target} />
        </>
    );
};

export default HomeOverview;