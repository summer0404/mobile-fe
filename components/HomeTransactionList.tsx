import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Transaction = {
  id: string | number;
  icon: string;
  iconColor: string;
  iconTextColor?: string;
  title: string;
  time: string;
  category: string;
  type: string;
  amount: number | string;
};

interface HomeTransactionListProps {
  transactions: Transaction[];
}

const HomeTransactionList: React.FC<HomeTransactionListProps> = ({ transactions }) => {
  return (
    <View className="space-y-4">
            {transactions.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center p-4 bg-none"
              >
                <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 ${item.iconColor}`}>
                  <MaterialCommunityIcons name={item.icon} size={28} className={item.iconTextColor} />
                </View>
                <View className="w-15">
                  <Text className="text-base font-semibold font-pmedium">{item.title}</Text>
                  <Text className="text-xs text-blue-600 te">{item.time}</Text>
                </View>
                <View className="w-px h-8 bg-slate-300 mx-3" />
                <View className="items-center w-15">
                  <Text className="text-xs text-textMuted">{item.category}</Text>
                </View>
                 <View className="w-px h-8 bg-slate-300 mx-3" />
                <Text
                  className={`text-base font-bold w-20 text-right ${
                    item.type === 'income' ? 'text-greenPositive' : 'text-redNegative'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}${item.amount}
                </Text>
              </View>
            ))}
          </View>
  )
}

export default HomeTransactionList;