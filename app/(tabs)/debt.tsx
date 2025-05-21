import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { theme } from '../../utils/theme';
import DebtList from '@/components/DebtList';
import { ActivityIndicator } from 'react-native';
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
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

      {
        isLoading ? (
          <View style={styles.content}>
            <ActivityIndicator size="large" color={theme.colors.violet600} />
          </View>
        ) : (
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/debt/addDebt')} // hoặc tên route của bạn
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            <DebtList data={filteredDebts} />
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
    padding: 32,
    paddingBottom: 16,
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
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  total: {
    backgroundColor: theme.colors.whiteText,
    padding: 14,
    borderRadius: 14,
    width: '80%',
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
    width: '80%',
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
    fontWeight: 'bold'
  },
  addButton: {
    backgroundColor: theme.colors.violet600,
    borderRadius: 11,
    alignItems: 'center',
    marginBottom: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    top: 20,
    right: 40,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },

});
