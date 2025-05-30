import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import HomeHeader from '../../components/HomeHeader'
import HomeOverview from '@/components/HomeOverview'
import HomeOverview2 from '@/components/HomeOverview2'
import FilterButtons from '@/components/FilterButtons'
import HomeTransactionList from '@/components/HomeTransactionList'

const transactions = [
  {
    id: 1,
    title: 'Salary',
    time: 'May 15, 2025',
    category: 'Income',
    type: 'income',
    amount: '5000',
    icon: 'cash',
    iconColor: 'bg-green-100',
    iconTextColor: 'text-green-600'
  },
  {
    id: 2,
    title: 'Rent',
    time: 'May 17, 2025',
    category: 'Housing',
    type: 'expense',
    amount: '1500',
    icon: 'home',
    iconColor: 'bg-blue-100',
    iconTextColor: 'text-blue-600'
  },
  {
    id: 3,
    title: 'Grocery',
    time: 'May 20, 2025',
    category: 'Food',
    type: 'expense',
    amount: '200',
    icon: 'cart',
    iconColor: 'bg-orange-100',
    iconTextColor: 'text-orange-600'
  }
];

const Home = () => {
  const filters = ['Daily', 'Weekly', 'Monthly']
  const [activeFilter, setActiveFilter] = useState('daily');

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar  />
      <ScrollView>
        <View className="p-6">
          <HomeHeader />
          <HomeOverview />
        </View>
        <View className="bg-primary-200 rounded-t-[50] mt-5 px-6 py-8 min-h-screen ">
          <HomeOverview2 revenue={4000000} food={1000} />
          <FilterButtons filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <HomeTransactionList transactions={transactions} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home