import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';
import HomeOverview from '@/components/HomeOverview'; 
import { ScrollView } from 'react-native-gesture-handler';
import FilterButtons from '@/components/FilterButtons';
import AnalysisChart from '@/components/AnalysisChart'; 
import IncomeExpense from '@/components/IncomeExpense'; 
import { StatusBar } from 'expo-status-bar';
import { getMe } from '@/services/authService';
import { getAllTransactions, Transaction, GetAllTransactionsParams, TransactionType } from '@/services/transactionsService';
import { useFocusEffect } from '@react-navigation/native';

// Helper to define date ranges based on filter
const getFilterDateRange = (filter: string): { startDate: Date, endDate: Date, periodLabelFormat: 'day' | 'week' | 'month' } => {
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date(today); // End of today for most cases
  endDate.setHours(23, 59, 59, 999);


  switch (filter) {
    case 'Daily': // Last 7 days
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate, periodLabelFormat: 'day' };
    case 'Weekly': // Last 4 weeks (current week Mon to Sun + 3 previous full weeks Mon to Sun)
      startDate = new Date(today);
      // Set to Monday of the current week
      startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
      startDate.setDate(startDate.getDate() - (3 * 7)); // Go back 3 more weeks
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate, periodLabelFormat: 'week' };
    case 'Monthly': // Last 6 months (current month + 5 previous full months)
      startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      startDate.setHours(0,0,0,0);
      return { startDate, endDate, periodLabelFormat: 'month' };
    case 'Year': // Current year, data aggregated by month
      startDate = new Date(today.getFullYear(), 0, 1); // Jan 1st of current year
      startDate.setHours(0,0,0,0);
      return { startDate, endDate, periodLabelFormat: 'month' }; // Use month for yearly aggregation
    default:
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate, periodLabelFormat: 'day' };
  }
};

// Helper to get a consistent key for a period
const getPeriodKey = (date: Date, periodType: 'day' | 'week' | 'month'): string => {
  const d = new Date(date);
  switch (periodType) {
    case 'day':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    case 'week':
      const dayOfWeek = d.getDay();
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
      const monday = new Date(d.getFullYear(), d.getMonth(), diff);
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
};

const Analysis = () => {
  const filters = ['Daily', 'Weekly', 'Monthly', 'Year'];
  const [activeFilter, setActiveFilter] = useState('Weekly'); // Default to weekly
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isLoadingUserId, setIsLoadingUserId] = useState(true);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overviewData, setOverviewData] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [chartData, setChartData] = useState<any[]>([]); // For AnalysisChart (gifted-charts format)
  const [expenseCategories, setExpenseCategories] = useState<{ name: string; totalAmount: number }[]>([]);

  // Fetch User ID
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUserId(true);
      try {
        const response = await getMe();
        if (response.success && response.data?.id) {
          setCurrentUserId(response.data.id);
        } else {
          if ((response as any).status === 401 || response.message?.toLowerCase().includes('unauthorized')) {
            router.replace('/auth/signIn');
            return;
          }
          setError('Failed to fetch user data.');
        }
      } catch (e: any) {
        if (e.response?.status === 401) {
          router.replace('/auth/signIn');
          return;
        }
        setError('An error occurred while fetching user data.');
        console.error("Analysis User Fetch Error:", e);
      } finally {
        setIsLoadingUserId(false);
      }
    };
    fetchUser();
  }, [router]);

  const fetchAnalysisData = useCallback(async () => {
    if (!currentUserId) return;

    setIsLoadingData(true);
    setError(null);

    const { startDate, endDate, periodLabelFormat } = getFilterDateRange(activeFilter);

    try {
      const params: GetAllTransactionsParams = {
        // userId: currentUserId,
        createFrom: startDate.getTime().toString(),
        createTo: endDate.getTime().toString(),
        limit: 10000, // Fetch a large number for the period
      };
      
      const response = await getAllTransactions(params);

      if (!response.success) {
        if ((response as any).status === 401 || response.message?.toLowerCase().includes('unauthorized')) {
          router.replace('/auth/signIn');
          return;
        }
        setError(response.message || response.error || 'Failed to fetch transactions.');
        setOverviewData({ totalIncome: 0, totalExpenses: 0, balance: 0 });
        setChartData([]);
        setExpenseCategories([]);
        return;
      }

      const transactions = response.data?.items || [];

      // Process for HomeOverview
      let totalIncomePeriod = 0;
      let totalExpensesPeriod = 0;
      const periodExpenseCategories: Record<string, number> = {};

      transactions.forEach(t => {
        const amount = parseFloat(String(t.amount) || '0');
        if (t.type === 'income' || t.type === 'lend') {
          totalIncomePeriod += amount;
        } else {
          totalExpensesPeriod += Math.abs(amount);
          periodExpenseCategories[t.type] = (periodExpenseCategories[t.type] || 0) + Math.abs(amount);
        }
      });
      setOverviewData({
        totalIncome: totalIncomePeriod,
        totalExpenses: totalExpensesPeriod,
        balance: totalIncomePeriod - totalExpensesPeriod,
      });
      setExpenseCategories(
        Object.entries(periodExpenseCategories)
          .map(([name, totalAmount]) => ({ name, totalAmount }))
          .sort((a, b) => b.totalAmount - a.totalAmount)
      );

      // Process for AnalysisChart
      const groupedData: Record<string, { income: number, expense: number, date: Date }> = {};
      
      // Initialize periods within the range to ensure all labels appear
      let currentDate = new Date(startDate);
      while(currentDate <= endDate) {
          const key = getPeriodKey(currentDate, periodLabelFormat);
          if (!groupedData[key]) {
              groupedData[key] = { income: 0, expense: 0, date: new Date(currentDate) };
          }
          if (periodLabelFormat === 'day') currentDate.setDate(currentDate.getDate() + 1);
          else if (periodLabelFormat === 'week') currentDate.setDate(currentDate.getDate() + 7);
          else if (periodLabelFormat === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
          else break; // Should not happen with current periodLabelFormats
      }


      transactions.forEach(t => {
        const amount = parseFloat(String(t.amount) || '0');
        const key = getPeriodKey(new Date(t.date), periodLabelFormat); // Group by transaction date
        if (groupedData[key]) { // Ensure key exists (it should due to pre-population)
            if (t.type === 'income' || t.type === 'lend') {
                groupedData[key].income += amount;
            } else {
                groupedData[key].expense += Math.abs(amount);
            }
        }
      });
      
      const newChartData: any[] = [];
      Object.keys(groupedData).sort((a,b) => groupedData[a].date.getTime() - groupedData[b].date.getTime()).forEach(key => {
        const item = groupedData[key];
        let label = '';
        if (periodLabelFormat === 'day') {
            label = item.date.toLocaleDateString('en-US', { weekday: 'short' }); // Specify locale
        } else if (periodLabelFormat === 'week') {
            const weekStart = new Date(item.date);
             // Ensure it's Monday for label consistency
            weekStart.setDate(item.date.getDate() - (item.date.getDay() === 0 ? 6 : item.date.getDay() -1));
            label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`; // Specify locale
        } else if (periodLabelFormat === 'month') {
            label = item.date.toLocaleDateString('en-US', { month: 'short' }); // Specify locale
        }

        newChartData.push({ value: item.income / 1000, label: label, frontColor: '#00D09E', spacing: 2, labelWidth: 40 }); // Income (in K)
        newChartData.push({ value: item.expense / 1000, frontColor: '#0068FF' }); // Expense (in K)
      });
      setChartData(newChartData);
    } catch (e: any) {
      if (e.response?.status === 401) {
        router.replace('/auth/signIn');
        return;
      }
      setError('An error occurred while fetching analysis data.');
      console.error("Analysis Data Fetch Error:", e);
      setOverviewData({ totalIncome: 0, totalExpenses: 0, balance: 0 });
      setChartData([]);
      setExpenseCategories([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUserId, activeFilter, router]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchAnalysisData();
      }
    }, [currentUserId, fetchAnalysisData])
  );

  if (isLoadingUserId) {
    return (
      <SafeAreaView className='flex-1 bg-primary justify-center items-center'>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar />
      
      <View className="p-6">
        <GoBackToHomeHeader title='Analysis' />
        <HomeOverview 
            // totalIncome={overviewData.totalIncome} 
            // totalExpenses={overviewData.totalExpenses} 
            // balance={overviewData.balance}
            // // You might need to adjust HomeOverview to accept these props or adapt data
        />
      </View>
      
      <View className="bg-primary-200 rounded-t-[50] flex-1">
        <View className="px-6 pt-8">
          <FilterButtons filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </View>
        
        {isLoadingData ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6A0DAD" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-5">
            <Text className="text-red-500 text-center">{error}</Text>
          </View>
        ) : (
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <AnalysisChart data={chartData} /> 
           
            {/* <IncomeExpense 
            // categories={expenseCategories}
             />  */}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  )
}

export default Analysis;