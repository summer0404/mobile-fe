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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Helper to define date ranges based on filter
const getFilterDateRange = (filter: string): { startDate: Date, endDate: Date, periodLabelFormat: 'day' | 'week' | 'month' | 'year' } => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let periodLabelFormat: 'day' | 'week' | 'month' | 'year';

  switch (filter) {
    case 'Daily': // Last 7 days
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      periodLabelFormat = 'day';
      break;
    case 'Weekly': // Last 4 weeks (28 days)
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      periodLabelFormat = 'week';
      break;
    case 'Monthly': // Last 4 months (including current month)
      // Go back 3 months from current month (3 months ago + current = 4 months)
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // End of current month
      periodLabelFormat = 'month';
      break;
    case 'Yearly': // Last 4 years
      startDate = new Date(now.getFullYear() - 3, 0, 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      periodLabelFormat = 'year';
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      periodLabelFormat = 'month';
  }

  console.log(`=== ${filter} Date Range ===`);
  console.log('Start:', startDate.toISOString());
  console.log('End:', endDate.toISOString());
  console.log('Start timestamp:', startDate.getTime());
  console.log('End timestamp:', endDate.getTime());
  
  return { startDate, endDate, periodLabelFormat };
};

// Replace the getPeriodKey function:
const getPeriodKey = (date: Date, periodType: 'day' | 'week' | 'month' | 'year'): string => {
  const transactionDate = new Date(date);
  
  switch (periodType) {
    case 'day':
      return transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'week':
      // Get Monday of the week containing this date
      const dayOfWeek = transactionDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1
      const monday = new Date(transactionDate);
      monday.setDate(transactionDate.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0); // Reset time to start of day
      return monday.toISOString().split('T')[0]; // Use Monday as week key
    case 'month':
      return `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    case 'year':
      return transactionDate.getFullYear().toString(); // YYYY
    default:
      return transactionDate.toISOString().split('T')[0];
  }
};

const Analysis = () => {
  const filters = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
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
        setError(response.message || response.error || 'Failed to fetch transactions.');
        setOverviewData({ totalIncome: 0, totalExpenses: 0, balance: 0 });
        setChartData([]);
        setExpenseCategories([]);
        return;
      }

      const transactions = response.data?.items || [];
      console.log('Raw transactions:', transactions.length);

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

      // **FIXED CHART DATA PROCESSING**
      const groupedData: Record<string, { income: number, expense: number, date: Date }> = {};
      
      // Initialize all periods in the range
      const periods = generatePeriods(startDate, endDate, periodLabelFormat);
      periods.forEach(period => {
        const key = getPeriodKey(period, periodLabelFormat);
        groupedData[key] = { income: 0, expense: 0, date: new Date(period) };
      });

      console.log('Initialized periods:', Object.keys(groupedData));

      // Group transactions by period
      transactions.forEach(t => {
        const transactionDate = new Date(t.date);
        const amount = parseFloat(String(t.amount) || '0');
        const key = getPeriodKey(transactionDate, periodLabelFormat);
        
        if (groupedData[key]) {
          if (t.type === 'income' || t.type === 'lend') {
            groupedData[key].income += amount;
          } else {
            groupedData[key].expense += Math.abs(amount);
          }
        }
      });

      console.log('Grouped data after processing:', groupedData);

      // Convert to chart format
      const newChartData: any[] = [];
      const sortedKeys = Object.keys(groupedData).sort((a, b) => 
        groupedData[a].date.getTime() - groupedData[b].date.getTime()
      );

      sortedKeys.forEach((key, index) => {
        const item = groupedData[key];
        const label = formatPeriodLabel(item.date, periodLabelFormat);
        
        // Determine spacing based on active filter
        const getSpacing = (isLastPair: boolean) => {
          if (activeFilter === 'Weekly') {
            return isLastPair ? 4 : 25; // Match AnalysisChart.tsx
          } else if (activeFilter === 'Daily') {
            return isLastPair ? 2 : 8;
          } else if (activeFilter === 'Yearly') {
            return isLastPair ? 4 : 30;
          } else { // Monthly
            return isLastPair ? 2 : 15;
          }
        };
        
        // Add income bar
        newChartData.push({
          value: Math.round((item.income / 1000) * 100) / 100,
          label: label,
          frontColor: '#00D09E',
          spacing: 2,
          labelWidth: activeFilter === 'Weekly' ? 40 : 50, // Adjust label width
        });
        
        // Add expense bar (paired with income)
        newChartData.push({
          value: Math.round((item.expense / 1000) * 100) / 100,
          frontColor: '#0068FF',
          spacing: getSpacing(index >= sortedKeys.length - 1),
        });
      });

      console.log('Final chart data:', newChartData);
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

  const insets = useSafeAreaInsets();

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
            contentContainerStyle={{ 
              paddingHorizontal: 24, 
              paddingBottom: insets.bottom + 100 // Safe area padding
            }}
            showsVerticalScrollIndicator={false}
          >
            <AnalysisChart data={chartData} activeFilter={activeFilter} /> 
           
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

// **ADD THESE HELPER FUNCTIONS**

// Generate periods between start and end dates
const generatePeriods = (startDate: Date, endDate: Date, periodType: 'day' | 'week' | 'month' | 'year'): Date[] => {
  const periods: Date[] = [];
  let currentDate = new Date(startDate);
  
  console.log(`Generating periods for ${periodType} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  switch (periodType) {
    case 'day':
      currentDate.setHours(0, 0, 0, 0); // Start of day
      while (currentDate <= endDate) {
        periods.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      break;
      
    case 'week':
      // Find the Monday of the first week
      const firstDayOfWeek = currentDate.getDay();
      const mondayOffset = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek;
      currentDate.setDate(currentDate.getDate() + mondayOffset);
      currentDate.setHours(0, 0, 0, 0);
      
      while (currentDate <= endDate) {
        periods.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 7); // Move to next Monday
      }
      break;
      
    case 'month':
      // Start from the first day of the start month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0);
      while (currentDate <= endDate) {
        periods.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      break;
      
    case 'year':
      // Start from January 1st of the start year
      currentDate = new Date(currentDate.getFullYear(), 0, 1, 0, 0, 0);
      while (currentDate <= endDate) {
        periods.push(new Date(currentDate));
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
      break;
  }
  
  console.log(`Generated ${periods.length} periods:`, periods.map(p => getPeriodKey(p, periodType)));
  return periods;
};

// Update formatPeriodLabel function:
const formatPeriodLabel = (date: Date, periodType: 'day' | 'week' | 'month' | 'year'): string => {
  switch (periodType) {
    case 'day':
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
      return weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short' });
    case 'year':
      return date.getFullYear().toString();
    default:
      return '';
  }
};