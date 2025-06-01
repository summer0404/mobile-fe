import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
import React, { useState, useCallback } from 'react';
import { theme } from '../../utils/theme';
import DebtList from '@/components/DebtList';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { handleFetchDebts } from '../../controller/DebtController';

export default function Debt() {
  const [debts, setDebts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load danh sách nợ khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await handleFetchDebts();
          if (isActive) {
            const transformed = data.items.map((item: any) => ({
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
          }
        } catch (error) {
          console.error('Failed to fetch debts:', error);
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

  const filteredDebts = debts.filter(debt =>
    filter === 'all' ? true : debt.type === filter
  );


  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <Pressable>
          <Ionicons name="arrow-back" size={24} color={theme.colors.violet600} />
        </Pressable>
        <Text style={styles.headerTitle}>Debt</Text>
        <Ionicons name="notifications" size={24} color="#fff" />
      </View>

      <TouchableOpacity
        style={[styles.total, filter === 'all' && { backgroundColor: theme.colors.purple300 }]}
        onPress={() => setFilter('all')}
      >
        <Text style={styles.buttonText}>Total Balance</Text>
        <Text style={styles.balanceAmount}>$7,783.00</Text>
      </TouchableOpacity>

      <View style={styles.option}>
        <TouchableOpacity
          style={[styles.lent, filter === 'lend' && { backgroundColor: theme.colors.purple300 }]}
          onPress={() => setFilter('lend')}
        >
          <Image
            source={require("../../assets/images/lent.png")}
            style={{ width: 30, height: 30, }}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Lent</Text>
          <Text style={styles.amount}>$4,120.00</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.lent, filter === 'borrow' && { backgroundColor: theme.colors.purple300 }]}
          onPress={() => setFilter('borrow')}
        >
          <Image
            source={require("../../assets/images/borrowed.png")}
            style={{ width: 30, height: 30, }}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Borrowed</Text>
          <Text style={styles.amount}>$1,187.40</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/debt/addDebt')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.violet600} />
        ) : (
          <DebtList data={filteredDebts} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: theme.colors.violet100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    position: 'relative',
  },
  total: {
    backgroundColor: theme.colors.whiteText,
    padding: 10,
    borderRadius: 14,
    width: '75%',
    height: 75,
    alignItems: 'center',
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
    height: 130,
    width: '75%',
  },
  lent: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: "47.5%",
    height: 100,
    alignItems: 'center',
    marginTop: 10,
  },
  borrowed: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: "47.5%",
    height: 100,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
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
  },
  addButton: {
    zIndex: 100,
    backgroundColor: theme.colors.violet600,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 30,
    height: 30,
    position: 'absolute',
    top: 30,
    right: 40,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 32,
  },
});
