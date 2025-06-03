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
  // Debug logging to see what iconColor values you're getting
  console.log('=== HomeTransactionList Debug ===');
  transactions.forEach((item, index) => {
    console.log(`Transaction ${index}:`, {
      title: item.title,
      iconColor: item.iconColor,
      iconTextColor: item.iconTextColor,
      icon: item.icon
    });
  });
  console.log('===============================');

  return (
    <View className="space-y-4">
      {transactions.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center p-4"
        >
          {/* Icon Section - Debug the background color */}
          <View 
            className={`w-12 h-12 rounded-xl justify-center items-center mr-4 flex-shrink-0`}
            style={{
              // Use style prop instead of className for dynamic colors
              backgroundColor: getBackgroundColor(item.iconColor),
            }}
          >
            <MaterialCommunityIcons 
              name={item.icon} 
              size={28} 
              color={getIconColor(item.iconTextColor)} 
            />
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

// Helper functions to convert class names to actual colors
const getBackgroundColor = (iconColor: string): string => {
  // Map Tailwind classes to actual colors
  const colorMap: { [key: string]: string } = {
    'bg-red-100': '#fef2f2',
    'bg-green-100': '#f0fdf4',
    'bg-blue-100': '#dbeafe',
    'bg-yellow-100': '#fefce8',
    'bg-purple-100': '#faf5ff',
    'bg-pink-100': '#fdf2f8',
    'bg-indigo-100': '#eef2ff',
    'bg-orange-100': '#fff7ed',
    'bg-gray-100': '#f3f4f6',
    'bg-slate-100': '#f1f5f9',
    'bg-cyan-100': '#ecfeff',
    'bg-rose-100': '#fff1f2',
    'bg-teal-100': '#f0fdfa',
    'bg-amber-100': '#fef3c7',
    // Add more colors as needed
  };
  
  return colorMap[iconColor] || '#f3f4f6'; // Default to gray if not found
};

const getIconColor = (iconTextColor?: string): string => {
  // Map Tailwind text colors to actual colors - Updated to -500 variants
  const colorMap: { [key: string]: string } = {
    // Updated from -600 to -500 variants
    'text-red-500': '#ef4444',
    'text-green-500': '#22c55e', 
    'text-green-600': '#16a34a', // Keep this for income
    'text-blue-500': '#3b82f6',
    'text-blue-600': '#2563eb', // Keep this for time display
    'text-yellow-500': '#eab308',
    'text-purple-500': '#a855f7',
    'text-pink-500': '#ec4899',
    'text-indigo-500': '#6366f1',
    'text-orange-500': '#f97316',
    'text-gray-500': '#6b7280',
    'text-slate-500': '#64748b',
    'text-cyan-500': '#06b6d4',
    'text-rose-500': '#f43f5e',
    'text-teal-500': '#14b8a6',
    'text-amber-500': '#f59e0b',
    
    'text-red-600': '#dc2626',
    'text-yellow-600': '#ca8a04',
    'text-purple-600': '#9333ea',
    'text-pink-600': '#db2777',
    'text-indigo-600': '#4f46e5',
    'text-orange-600': '#ea580c',
    'text-gray-600': '#4b5563',
  };
  
  return colorMap[iconTextColor || ''] || '#6b7280'; // Default to gray-500 if not found
};

export default HomeTransactionList;