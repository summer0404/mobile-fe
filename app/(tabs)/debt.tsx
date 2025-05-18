import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../utils/theme';
import DebtList from '@/components/DebtList';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';

type DebtItem = {
  id: string;
  type: 'lend' | 'borrow';
};

export default function Debt() {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('https://6829e5e9ab2b5004cb35235d.mockapi.io/debts');
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

  const filteredDebts = debts.filter(debt =>
    filter === 'all' ? true : debt.type === filter
  );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debt</Text>

      <TouchableOpacity
        style={[
          styles.total,
          filter === 'all' && { backgroundColor: theme.colors.purple300 },
        ]}
        onPress={() => setFilter('all')}
      >
        <Text style={styles.buttonText}>Total Balance</Text>
      </TouchableOpacity>

      <View style={styles.option}>
        <TouchableOpacity
          style={[
            styles.lent,
            filter === 'lend' && { backgroundColor: theme.colors.purple300 },
          ]}
          onPress={() => setFilter('lend')}
        >
          <Text style={styles.buttonText}>Lent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.borrowed,
            filter === 'borrow' && { backgroundColor: theme.colors.purple300 },
          ]}
          onPress={() => setFilter('borrow')}
        >
          <Text style={styles.buttonText}>Borrowed</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.subContainer}>
          <ActivityIndicator size="large" color={theme.colors.violet600} />
        </View>
      ) : (
        <ScrollView style={styles.subContainer}>
          <DebtList data={filteredDebts} />
          <View style={{ height: 50 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: theme.colors.violet600,
    paddingTop: 20,
  },
  subContainer: {
    position: 'absolute',
    paddingLeft: 28,
    paddingRight: 28,
    paddingTop: 30,
    paddingBottom: 200,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    width: '100%',
    height: '65%',
    bottom: 0,
    backgroundColor: theme.colors.violet100,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.whiteText,
    margin: 0,
    alignSelf: 'center',
  },
  total: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: '80%',
    height: '12%',
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
    height: '14%',
  },
  lent: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: '37.5%',
    height: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  borrowed: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: '37.5%',
    height: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold'
  },
});
