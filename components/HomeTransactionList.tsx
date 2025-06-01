import { View, Text } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Transaction = {
  id: string | number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; 
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
          className="flex-row items-center p-4"
        >
          {/* Icon Section */}
          <View className={`w-12 h-12 rounded-xl justify-center items-center mr-4 flex-shrink-0 ${item.iconColor}`}>
            <Text className={item.iconTextColor}>
              <MaterialCommunityIcons name={item.icon} size={28} />
            </Text>
          </View>

          {/* Title and Time Section - Flexible Width */}
          <View className="flex-1 min-w-0">
            <Text className="text-base font-psemibold" numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
            <Text className="text-xs text-blue-600">{item.time}</Text>
          </View>

          {/* Separator */}
          <View className="w-px h-8 bg-slate-300 mx-3" />
          
          {/* Amount Section - Controlled Width */}
          <View className="w-20 items-end flex-shrink-0">
            <Text
              className={`text-base font-pbold ${
                item.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {item.type === 'income' ? '+' : '-'}${item.amount}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default HomeTransactionList;