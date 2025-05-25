// app/allTransactions.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import numeral from 'numeral';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';

import { TransactionItemData } from '@/components/addTransaction/types'
import { groupTransactionsByMonth } from '@/utils/transactionHelpers';
import dummyTransactions from '@/constants/dummyTransactions';


// Reusable component for each transaction item in the list
const TransactionListItem: React.FC<{ item: TransactionItemData }> = ({ item }) => {
    const router = useRouter();
    const handlePress = () => {
        router.push({
            pathname: `/transaction/[id]`,
            params: { id: item.id, transactionData: JSON.stringify(item) }, // Pass id and data
        });
    };

    return (
        <TouchableOpacity onPress={handlePress} className="flex-row items-center py-3 mb-2">
            <View className="w-12 h-12 bg-accent/20 rounded-xl justify-center items-center mr-4">
                <MaterialCommunityIcons name={item.iconName} size={28} className="text-accent" />
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold text-textDark">{item.title}</Text>
                <Text className="text-xs text-textMuted">{item.dateTime}</Text>
            </View>
            <View className="w-px h-8 bg-slate-300 mx-3" />
            <Text className="text-xs text-textMuted w-16 text-center">{item.categoryDisplay}</Text>
            <View className="w-px h-8 bg-slate-300 mx-3" />
            <Text
                className={`text-base font-bold w-24 text-right ${item.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}
            >
                {item.type === 'income' ? '+' : '-'}${item.amount}
            </Text>
        </TouchableOpacity>
    );
};


type TransactionFilterType = 'all' | 'income' | 'expense';

const AllTransactionsScreen = () => {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState<TransactionFilterType>('all');


    const transactions = dummyTransactions; // Use dummy data

    const filteredTransactions = useMemo(() => {
        if (activeFilter === 'all') {
            return transactions;
        }
        return transactions.filter(t => t.type === activeFilter);
    }, [transactions, activeFilter]);

    const totalBalance = transactions.reduce((sum, t) => sum + t.amountRaw, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amountRaw, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amountRaw, 0);



    const groupedTransactions = useMemo(() => groupTransactionsByMonth(filteredTransactions), [filteredTransactions]);
    const sortedMonthKeys = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) => {
            return new Date(b).getTime() - new Date(a).getTime();
        });
    }, [groupedTransactions]);




    return (
        <SafeAreaView className="flex-1 bg-primary">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />


            <GoBackToHomeHeader title='Transactions' />


            <View className="px-6 pb-6 space-y-3">
                {/* Total Balance card - usually not filterable by type */}
                <View className={`bg-white/20 p-4 rounded-xl shadow`}>
                    <Text className="text-sm text-white/80 mb-1">Total Balance</Text>
                    <Text className="text-3xl font-bold text-white">{numeral(totalBalance).format('$0,0.00')}</Text>
                </View>

                <View className="flex-row space-x-3">
                    {/* Income Card */}
                    <TouchableOpacity
                        className={`flex-1 p-4 rounded-xl shadow items-center
                        ${activeFilter === 'income' ? 'bg-white/40 border-2 border-white' : 'bg-white/20'}`}
                        onPress={() => setActiveFilter(prev => prev === 'income' ? 'all' : 'income')} // Toggle or set
                    >
                        <MaterialCommunityIcons name="arrow-top-right-thick" size={20} color="white" />
                        <Text className="text-sm text-white/80 mt-1 mb-0.5">Income</Text>
                        <Text className="text-xl font-bold text-white">{numeral(totalIncome).format('$0,0.00')}</Text>
                    </TouchableOpacity>

                    {/* Expense Card */}
                    <TouchableOpacity
                        className={`flex-1 p-4 rounded-xl shadow items-center
                        ${activeFilter === 'expense' ? 'bg-white/40 border-2 border-white' : 'bg-white/20'}`}
                        onPress={() => setActiveFilter(prev => prev === 'expense' ? 'all' : 'expense')} // Toggle or set
                    >
                        <MaterialCommunityIcons name="arrow-bottom-left-thick" size={20} color="white" />
                        <Text className="text-sm text-white/80 mt-1 mb-0.5">Expense</Text>
                        <Text className="text-xl font-bold text-white">{numeral(Math.abs(totalExpense)).format('$0,0.00')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content Area with Transaction List */}
            <View className="flex-1 bg-primary-200 rounded-t-[30px] pt-1">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 80 }} // Space for bottom nav
                    showsVerticalScrollIndicator={false}
                >
                    {sortedMonthKeys.map((monthYear) => (
                        <View key={monthYear} className="mb-3 mt-4">
                            <View className="flex-row justify-between items-center mb-3">
                                <Text className="text-lg font-semibold text-textDark">{monthYear.split(' ')[0]}</Text> {/* Only month name */}
                                {monthYear === sortedMonthKeys[0] && ( // Show calendar only for the first (latest) month group or always
                                    <TouchableOpacity className="p-2 bg-purple-300 rounded-lg">
                                        <MaterialCommunityIcons name="calendar-month-outline" size={22} className="text-accent" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {groupedTransactions[monthYear].map((item) => (
                                <TransactionListItem key={item.id} item={item} />
                            ))}
                        </View>
                    ))}
                    {transactions.length === 0 && (
                        <Text className="text-center text-textMuted mt-10">No transactions yet.</Text>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default AllTransactionsScreen;