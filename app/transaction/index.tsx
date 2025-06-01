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
import { getAllTransactions, Transaction as ApiTransaction, GetAllTransactionsParams, PaginatedTransactionsResponse, TransactionType as ApiUITransactionType } from '@/services/transactionsService'; // Import PaginatedTransactionsResponse
import { getMe } from '@/services/authService';
import { mapApiTransactionToUi } from '@/utils/dataTransformers';

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
                <Text className="text-base font-semibold text-textDark" numberOfLines={1}>{item.title}</Text>
                <Text className="text-xs text-textMuted">{item.dateTime}</Text>
            </View>
            <View className="w-px h-8 bg-slate-300 mx-3" />
            <Text className="text-xs text-textMuted w-16 text-center" numberOfLines={1}>{item.categoryDisplay}</Text>
            <View className="w-px h-8 bg-slate-300 mx-3" />
            <Text
                className={`text-base font-bold w-24 text-right ${
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
    // Add state for pagination meta if you plan to use it
    // const [meta, setMeta] = useState<PaginatedTransactionsResponse['meta'] | null>(null); // Optional: if you want to store meta


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

        const params: GetAllTransactionsParams = {
            userId: currentUserId,
            limit: 100,
            sort: 'date:desc',
        };

        if (activeFilter === 'income') {
            params.type = 'income';
        }

        console.log(`Fetching transactions with params:`, params, `Active filter: ${activeFilter}`);

        const response = await getAllTransactions(params);

        if (response.success && response.data) {
            // response.data is now PaginatedTransactionsResponse
            if (response.data.items && Array.isArray(response.data.items)) {
                setApiTransactions(response.data.items);
                // if (response.data.meta) { // Optional: store meta
                //     setMeta(response.data.meta);
                // }
            } else {
                // This case should be less likely if the service correctly parses
                console.warn("API response data.items is not an array or is missing:", response.data);
                setApiTransactions([]);
                setError("Received unexpected data format from server (items missing).");
            }
        } else {
            setError(response.message || response.error || "Failed to fetch transactions.");
            setApiTransactions([]);
        }
        setIsLoading(false);
    }, [currentUserId, activeFilter]);

    useFocusEffect(
        useCallback(() => {
            if (currentUserId) {
                fetchTransactions();
            }
        }, [currentUserId, fetchTransactions])
    );

    // The uiTransactions useMemo will continue to work as apiTransactions is still Transaction[]
    const uiTransactions: TransactionItemData[] = useMemo(() => {
        if (!Array.isArray(apiTransactions)) {
            console.warn(
                "apiTransactions is not an array when calculating uiTransactions. Value:",
                apiTransactions // This should now always be an array or become empty due to the fix
            );
            return [];
        }
        return apiTransactions.map(mapApiTransactionToUi);
    }, [apiTransactions]);


    const filteredUiTransactions = useMemo(() => {
        if (activeFilter === 'expense') {
            // Client-side filtering for the 'expense' tab
            return uiTransactions.filter(transaction =>
                transaction.originalApiType !== 'income' &&
                transaction.originalApiType !== 'borrow' &&
                transaction.originalApiType !== 'lend'
            );
        }
        // For 'all' and 'income', uiTransactions already reflects the desired data
        // (all data for 'all', API-filtered income data for 'income')
        return uiTransactions;
    }, [uiTransactions, activeFilter]); // Add activeFilter as a dependency

    const totalBalance = useMemo(() => filteredUiTransactions.reduce((sum, t) => sum + t.amountRaw, 0), [filteredUiTransactions]);
    const totalIncome = useMemo(() =>
        filteredUiTransactions
            .filter(t => t.originalApiType === 'income' || t.originalApiType === 'lend')
            .reduce((sum, t) => sum + Math.abs(t.amountRaw), 0),
        [filteredUiTransactions]
    );
    const totalExpense = useMemo(() =>
        filteredUiTransactions
            .filter(t => t.originalApiType !== 'income' && t.originalApiType !== 'lend')
            .reduce((sum, t) => sum + Math.abs(t.amountRaw), 0),
        [filteredUiTransactions]
    );


    const groupedTransactions = useMemo(() => groupTransactionsByMonth(filteredUiTransactions), [filteredUiTransactions]);
    const sortedMonthKeys = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) => {
            const dateA = new Date(Number(a.split(' ')[1]), getMonthIndex(a.split(' ')[0]));
            const dateB = new Date(Number(b.split(' ')[1]), getMonthIndex(b.split(' ')[0]));
            return dateB.getTime() - dateA.getTime();
        });
    }, [groupedTransactions]);

    const getMonthIndex = (monthName: string) => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return months.indexOf(monthName);
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
        <SafeAreaView className="flex-1 bg-primary">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />
            <GoBackToHomeHeader title='Transactions' />

            <View className="px-6 pb-6 space-y-3">
                <View className={`bg-white/20 p-4 rounded-xl shadow`}>
                    <Text className="text-sm text-white/80 mb-1">Total Balance</Text>
                    <Text className="text-3xl font-bold text-white">{numeral(totalBalance).format('$0,0.00')}</Text>
                </View>
                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        className={`flex-1 p-4 rounded-xl shadow items-center ${activeFilter === 'income' ? 'bg-white/40 border-2 border-white' : 'bg-white/20'}`}
                        onPress={() => setActiveFilter(prev => prev === 'income' ? 'all' : 'income')}
                    >
                        <MaterialCommunityIcons name="arrow-top-right-thick" size={20} color="white" />
                        <Text className="text-sm text-white/80 mt-1 mb-0.5">Income</Text>
                        <Text className="text-xl font-bold text-white">{numeral(totalIncome).format('$0,0.00')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 p-4 rounded-xl shadow items-center ${activeFilter === 'expense' ? 'bg-white/40 border-2 border-white' : 'bg-white/20'}`}
                        onPress={() => setActiveFilter(prev => prev === 'expense' ? 'all' : 'expense')}
                    >
                        <MaterialCommunityIcons name="arrow-bottom-left-thick" size={20} color="white" />
                        <Text className="text-sm text-white/80 mt-1 mb-0.5">Expense</Text>
                        <Text className="text-xl font-bold text-white">{numeral(totalExpense).format('$0,0.00')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 bg-primary-200 rounded-t-[30px] pt-1">
                {isLoading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#1A1A2E" />
                        <Text className="text-textDark mt-2">Loading transactions...</Text>
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
                                    <Text className="text-lg font-semibold text-textDark">{monthYear.split(' ')[0]}</Text>
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