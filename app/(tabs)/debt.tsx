import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../utils/theme';
import DebtList from '@/components/DebtList';
import { ActivityIndicator, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type DebtItem = {
  id: string;
  type: 'lend' | 'borrow';
};

export default function Debt() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`https://6829e5e9ab2b5004cb35235d.mockapi.io/debts`);
          const data = await response.json();
          if (isActive) {
            setDebts(data);
          }
        } catch (error) {
          console.error('Failed to fetch debts:', error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A4EFF" />
      </View>
    );
  }

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Pressable>
          <Ionicons name="arrow-back" size={24} color={theme.colors.violet600} />
        </Pressable>
        <Text style={styles.headerTitle}>Debt</Text>
        <Ionicons name="notifications" size={24} color="#fff" />
      </View>


      <TouchableOpacity
        style={[
          styles.total,
          filter === 'all' && { backgroundColor: theme.colors.purple300 },
        ]}
        onPress={() => setFilter('all')}
      >
        <Text style={styles.buttonText}>Total Balance</Text>
        <Text style={styles.balanceAmount}>$7,783.00</Text>
      </TouchableOpacity>

      <View style={styles.option}>
        <TouchableOpacity
          style={[
            styles.lent,
            filter === 'lend' && { backgroundColor: theme.colors.purple300 },
          ]}
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
          style={[
            styles.borrowed,
            filter === 'borrow' && { backgroundColor: theme.colors.purple300 },
          ]}
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

      {
        isLoading ? (
          <View style={styles.content}>
            <ActivityIndicator size="large" color={theme.colors.violet600} />
          </View>
        ) : (
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.addButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => router.push('/debt/addDebt')}
            >
              <Image
                source={require('../../assets/images/addButton.png')}
                style={{ width: 30, height: 30, }}
                resizeMode="contain"
              ></Image>
              {/* <Text style={styles.addButtonText}>+</Text> */}
            </TouchableOpacity>

            <DebtList data={filteredDebts} />
            <View style={{ height: 30 }} ></View>
          </View>

        )
      }
    </ScrollView >
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 16,
    color: theme.colors.whiteText,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
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
