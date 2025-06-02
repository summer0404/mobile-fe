import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { theme } from '../../utils/theme';
import DebtList from '@/components/DebtList';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { handleFetchDebts } from '../../controller/DebtController';
import numeral from 'numeral'; // For formatting numbers
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';

// Define a more specific type for your debt items
interface DebtItem {
  id: number | string;
  debtorName: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue'; // Assuming these are possible statuses
  debt_date: Date;
  type: 'lend' | 'borrow';
  name: string;
  amount: number;
  detail?: string;
}


export default function Debt() {
  const [debts, setDebts] = useState<DebtItem[]>([]); // Use specific type
  const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // States for calculated totals
  const [calculatedTotalLent, setCalculatedTotalLent] = useState(0);
  const [calculatedTotalBorrowed, setCalculatedTotalBorrowed] = useState(0);
  const [calculatedTotalBalance, setCalculatedTotalBalance] = useState(0);


  // Load danh sách nợ khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const responseData = await handleFetchDebts();
          if (isActive && responseData && responseData.items) {
            const transformed: DebtItem[] = responseData.items.map((item: any) => ({
              id: item.id,
              debtorName: item.debtorName,
              dueDate: new Date(item.dueDate),
              status: item.status,
              debt_date: new Date(item.transaction.date),
              type: ['lend', 'borrow'].includes(item.transaction.type) ? item.transaction.type : 'lend',
              name: item.transaction.name,
              amount: parseFloat(item.transaction.amount),
              detail: item.transaction.detail,
            }));
            setDebts(transformed);
          } else if (isActive) {
            setDebts([]);
          }
        } catch (error) {
          console.error('Failed to fetch debts:', error);
          if (isActive) setDebts([]);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Calculate totals whenever debts data changes
  useEffect(() => {
    let totalLent = 0;
    let totalBorrowed = 0;

    debts.forEach(debt => {
      if (debt.status === 'pending') {
        if (debt.type === 'lend') {
          totalLent += debt.amount;
        } else if (debt.type === 'borrow') {
          totalBorrowed += debt.amount;
        }
      }
    });

    setCalculatedTotalLent(totalLent);
    setCalculatedTotalBorrowed(totalBorrowed);
    setCalculatedTotalBalance(totalLent - totalBorrowed);
  }, [debts]);


  const filteredDebts = debts.filter(debt =>
    filter === 'all' ? true : debt.type === filter
  );

  const onRefresh = async () => {
    setRefreshing(true);

    const fetchData = async () => {
      try {
        const responseData = await handleFetchDebts();
        if (responseData && responseData.items) {
          const transformed: DebtItem[] = responseData.items.map((item: any) => ({
            id: item.id,
            debtorName: item.debtorName,
            dueDate: new Date(item.dueDate),
            status: item.status,
            debt_date: new Date(item.transaction.date),
            type: ['lend', 'borrow'].includes(item.transaction.type) ? item.transaction.type : 'lend',
            name: item.transaction.name,
            amount: parseFloat(item.transaction.amount),
            detail: item.transaction.detail,
          }));
          setDebts(transformed);
        } else {
          setDebts([]);
        }
      } catch (error) {
        console.error('Failed to fetch debts on refresh:', error);
        setDebts([]);
      } finally {
        setRefreshing(false);
      }
    };
    fetchData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    // Add RefreshControl if you want pull-to-refresh functionality
    // refreshControl={
    //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    // }
    >
      {/* <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.violet600} />
        </Pressable>
        <Text style={styles.headerTitle}>Debt</Text>
        <Ionicons name="notifications" size={24} color={theme.colors.whiteText} />
      </View> */}
      <View className='p-6'>
        <GoBackToHomeHeader title='Debt' />
      </View>
      
      <TouchableOpacity
        style={[styles.total, filter === 'all' && { backgroundColor: theme.colors.purple300 }]}
        onPress={() => setFilter('all')}
      >
        <Text style={styles.buttonText}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{numeral(calculatedTotalBalance).format('$0,0.00')}</Text>
      </TouchableOpacity>

      <View style={styles.option}>
        <TouchableOpacity
          style={[styles.lent, filter === 'lend' && { backgroundColor: theme.colors.purple300 }]}
          onPress={() => setFilter('lend')}
        >
          <Image source={require("../../assets/images/lent.png")} style={{ width: 30, height: 30 }} resizeMode="contain" />
          <Text style={styles.buttonText}>Lent</Text>
          <Text style={styles.amount}>{numeral(calculatedTotalLent).format('$0,0.00')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.lent, filter === 'borrow' && { backgroundColor: theme.colors.purple300 }]} // Assuming 'lent' style can be reused
          onPress={() => setFilter('borrow')}
        >
          <Image source={require("../../assets/images/borrowed.png")} style={{ width: 30, height: 30 }} resizeMode="contain" />
          <Text style={styles.buttonText}>Borrowed</Text>
          <Text style={styles.amount}>{numeral(calculatedTotalBorrowed).format('$0,0.00')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/debt/addDebt')} // Navigate to add debt screen
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.violet600} style={{ marginTop: 50 }} />
        ) : (
          <DebtList data={filteredDebts} />
        )}
      </View>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.violet600,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.colors.violet600,
    padding: 30,
    paddingBottom: 16,
    paddingTop: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    position: 'relative',
    minHeight: 300,
  },
  total: {
    backgroundColor: theme.colors.whiteText,
    padding: 10,
    borderRadius: 14,
    width: '75%',
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  option: {
    gap: '5%',
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
    width: '75%',
    marginVertical: 10,
  },
  lent: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: "47.5%",
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  balanceAmount: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  amount: {
    color: '#000',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 24,
    marginTop: 4,
  },
  addButton: {
    zIndex: 100,
    backgroundColor: theme.colors.violet600,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    position: 'absolute',
    top: 20,
    right: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: 'bold',
  },
});
