import { View, Text, SafeAreaView } from 'react-native'
import React, { useState } from 'react'
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader'
import HomeOverview from '@/components/HomeOverview'
import { ScrollView } from 'react-native-gesture-handler'
import FilterButtons from '@/components/FilterButtons'
import AnalysisChart from '@/components/AnalysisChart'
import IncomeExpense from '@/components/IncomeExpense'
import { StatusBar } from 'expo-status-bar'

const Analysis = () => {
  const filters = ['Daily', 'Weekly', 'Monthly', 'Year']
  const [activeFilter, setActiveFilter] = useState('Daily');

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <StatusBar backgroundColor='#7C3AED' />
      
      {/* Fixed header section */}
      <View className="p-6">
        <GoBackToHomeHeader title='Analysis' />
        <HomeOverview />
      </View>
      
      {/* Scrollable content section */}
      <View className="bg-primary-200 rounded-t-[50] flex-1">
        {/* Fixed filter buttons at top of content */}
        <View className="px-6 pt-8">
          <FilterButtons filters={filters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </View>
        
        {/* Scrollable content below filters */}
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        >
          <AnalysisChart />
          <IncomeExpense />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default Analysis