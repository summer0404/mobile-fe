// app/allTransactions.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import numeral from 'numeral';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';

// Types for local UI display
// Ensure TransactionItemData from this path includes 'originalApiType'
import { TransactionItemData, TransactionTypeId as LocalUITransactionType } from '@/components/addTransaction/types';
import { groupTransactionsByMonth } from '@/utils/transactionHelpers';
// API service and types
import { getAllTransactions, Transaction as ApiTransaction, GetAllTransactionsParams, TransactionType as ApiUITransactionType, getAllExpenseTransactions, PaginatedTransactionsResponse } from '@/services/transactionsService'; // Import PaginatedTransactionsResponse
import { getMe } from '@/services/authService';
import { mapApiTransactionToUi } from '@/utils/dataTransformers';

// --- Move getMonthIndex outside the component ---
const getMonthIndex = (monthName: string): number => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const index = months.indexOf(monthName);
    if (index === -1) {
        console.warn(`Month name "${monthName}" not found in getMonthIndex. Defaulting to January (0).`);
        return 0; // Default to January or handle error appropriately
    }
    return index;
};

// Reusable component for each transaction item in the list
const TransactionListItem: React.FC<{ item: TransactionItemData }> = ({ item }) => {
    const router = useRouter();
    const handlePress = () => {
        router.push({
            pathname: `/transaction/[id]`,
            params: { id: String(item.id), transactionData: JSON.stringify(item) },
        });
    };

    return (
        <TouchableOpacity onPress={handlePress} className="flex-row items-center py-3 mb-2">
            <View className="w-12 h-12 bg-accent/20 rounded-xl justify-center items-center mr-4">
                <MaterialCommunityIcons name={item.iconName} size={28} className="text-accent" />
            </View>
            <View className="flex-1">
                <Text className="text-base font-psemibold text-black" numberOfLines={1}>{item.title}</Text>
                <Text className="text-xs text-textMuted">{item.dateTime}</Text>
            </View>
            <View className="w-px h-8 bg-slate-300 mx-3" />
            <Text className="text-xs text-textMuted w-16 text-center" numberOfLines={1}>{item.categoryDisplay}</Text>
            <View className="w-px h-8 bg-slate-300 mx-3" />
            <Text
                className={`text-base font-pbold w-24 text-right ${
                    // Use amountRaw for color coding based on actual financial impact
                    item.amountRaw >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
            >
                {item.amountRaw >= 0 ? '+' : '-'}{numeral(Math.abs(item.amountRaw)).format('0,0.00')}
            </Text>
        </TouchableOpacity>
    );
};

type TransactionFilterType = 'all' | 'income' | 'expense';

const AllTransactionsScreen = () => {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<TransactionFilterType>('all');
    const [apiTransactions, setApiTransactions] = useState<ApiTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingUserId, setIsLoadingUserId] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    // const [meta, setMeta] = useState<PaginatedTransactionsResponse['meta'] | null>(null);


    useEffect(() => {
        const fetchUserId = async () => {
            setIsLoadingUserId(true);
            const response = await getMe();
            if (response.success && response.data?.id) {
                setCurrentUserId(response.data.id);
            } else {
                setError("Failed to fetch user data. Please try again.");
                Alert.alert("Error", "Could not load user information. Please try logging in again.");
            }
            setIsLoadingUserId(false);
        };
        fetchUserId();
    }, []);

    const fetchTransactions = useCallback(async () => {
        if (!currentUserId) {
            setApiTransactions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Always fetch all (non-debt) transactions for the purpose of totals and base list
        const params: GetAllTransactionsParams = {
            // userId: currentUserId, // Assuming backend infers user from session/token
            limit: 100, // Adjust as needed, or implement pagination controls
            sort: 'date:desc',
            // No 'type' filter here, to get all relevant transactions for card totals
            // 'borrow' and 'lend' will be filtered out client-side in `uiTransactions`
        };
        console.log(`Fetching ALL transactions for totals and list base with params:`, params);
        // Always use getAllTransactions without a specific type filter for the base dataset
        const response = await getAllTransactions(params);


        if (response.success && response.data) {
            const paginatedData = response.data as PaginatedTransactionsResponse;

            if (paginatedData && paginatedData.items && Array.isArray(paginatedData.items)) {
                setApiTransactions(paginatedData.items);
            } else {
                const dataType = 'transactions'; // Generic term as we are fetching all
                console.warn(`Response for ${dataType} is missing 'items' array or has unexpected structure:`, paginatedData);
                setApiTransactions([]);
                setError(`Received unexpected data format for ${dataType}.`);
            }
        } else {
            setError(response.message || response.error || "Failed to fetch transactions.");
            setApiTransactions([]);
        }
        setIsLoading(false);
    }, [currentUserId]); // Removed activeFilter from dependencies, as it no longer affects the fetch query

    useFocusEffect(
        useCallback(() => {
            if (currentUserId) {
                fetchTransactions();
            }
        }, [currentUserId, fetchTransactions])
    );

    const uiTransactions: TransactionItemData[] = useMemo(() => {
        if (!Array.isArray(apiTransactions)) {
            console.warn(
                "apiTransactions is not an array when calculating uiTransactions. Value:",
                apiTransactions
            );
            return [];
        }
        // Filter out 'borrow' and 'lend' types before mapping
        // This uiTransactions is the complete set for card totals
        return apiTransactions
            .filter(transaction => transaction.type !== 'borrow' && transaction.type !== 'lend')
            .map(mapApiTransactionToUi);
    }, [apiTransactions]);


    // Calculate totalIncome and totalExpense from the complete uiTransactions set
    const totalIncome = useMemo(() =>
        uiTransactions // Base on the full uiTransactions
            .filter(t => t.originalApiType === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amountRaw), 0),
        [uiTransactions] // Dependency is the full uiTransactions
    );
    const totalExpense = useMemo(() =>
        uiTransactions // Base on the full uiTransactions
            // 'borrow' and 'lend' are already excluded from uiTransactions.
            // So, anything not 'income' is considered an expense for this card.
            .filter(t => t.originalApiType !== 'income')
            .reduce((sum, t) => sum + Math.abs(t.amountRaw), 0),
        [uiTransactions] // Dependency is the full uiTransactions
    );

    // filteredUiTransactions will apply the activeFilter for the list display
    const filteredUiTransactions = useMemo(() => {
        if (activeFilter === 'all') {
            return uiTransactions;
        }
        return uiTransactions.filter(t => {
            if (activeFilter === 'income') {
                return t.originalApiType === 'income';
            }
            if (activeFilter === 'expense') {
                // Since 'borrow' and 'lend' are already out of uiTransactions,
                // 'expense' here means any other non-income transaction.
                return t.originalApiType !== 'income';
            }
            return true; // Should not be reached if activeFilter is valid
        });
    }, [uiTransactions, activeFilter]);


    const groupedTransactions = useMemo(() => groupTransactionsByMonth(filteredUiTransactions), [filteredUiTransactions]);
    const sortedMonthKeys = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) => {
            const dateA = new Date(Number(a.split(' ')[1]), getMonthIndex(a.split(' ')[0]));
            const dateB = new Date(Number(b.split(' ')[1]), getMonthIndex(b.split(' ')[0]));
            return dateB.getTime() - dateA.getTime();
        });
    }, [groupedTransactions]);

    if (isLoadingUserId) {
        return (
            <SafeAreaView className="flex-1 bg-primary justify-center items-center">
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white mt-2">Loading user data...</Text>
            </SafeAreaView>
        );
    }

    return (

        <SafeAreaView className="flex-1 bg-primary">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar />
            <GoBackToHomeHeader title='Transactions' />

            <View className="px-6 pb-6 space-y-3">
                <View className="flex-row">
                    <TouchableOpacity
                        className={`flex-1 p-4 rounded-xl shadow items-center ${activeFilter === 'income' ? 'bg-white/40 border-2 border-white' : 'bg-white/20'}`}
                        onPress={() => setActiveFilter(prev => prev === 'income' ? 'all' : 'income')}
                    >
                        <MaterialCommunityIcons name="arrow-top-right-thick" size={20} color="white" />
                        <Text className="text-sm text-white/80 mt-1 mb-0.5">Income</Text>
                        <Text className="text-xl font-pbold text-white">{numeral(totalIncome).format('$0,0.00')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`ml-5 flex-1 p-4 rounded-xl shadow items-center ${activeFilter === 'expense' ? 'bg-white/40 border-2 border-white' : 'bg-white/20'}`}
                        onPress={() => setActiveFilter(prev => prev === 'expense' ? 'all' : 'expense')}
                    >
                        <MaterialCommunityIcons name="arrow-bottom-left-thick" size={20} color="white" />
                        <Text className="text-sm text-white/80 mt-1 mb-0.5">Expense</Text>
                        <Text className="text-xl font-pbold text-white">{numeral(totalExpense).format('$0,0.00')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 bg-primary-200 rounded-t-[30px] pt-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#1A1A2E" />
                        <Text className="text-black mt-2">Loading transactions...</Text>
                    </View>
                ) : error ? (
                    <View className="flex-1 justify-center items-center p-5">
                        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="red" />
                        <Text className="text-center text-red-600 mt-2">{error}</Text>
                        <TouchableOpacity onPress={fetchTransactions} className="mt-4 bg-primary p-3 rounded-lg">
                            <Text className="text-white font-psemibold">Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {sortedMonthKeys.length > 0 ? sortedMonthKeys.map((monthYear) => (
                            <View key={monthYear} className="mb-3 mt-4">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-lg font-psemibold text-black">{monthYear.split(' ')[0]}</Text>
                                </View>
                                {groupedTransactions[monthYear].map((item) => (
                                    <TransactionListItem key={item.id} item={item} />
                                ))}
                            </View>
                        )) : (
                            <Text className="text-center text-textMuted mt-20">No transactions found for the selected filter.</Text>
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

export default AllTransactionsScreen;