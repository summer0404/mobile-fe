import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BarChart } from 'react-native-gifted-charts'

const AnalysisChart = () => {
    // Use useWindowDimensions hook for responsive sizing
    const { width } = useWindowDimensions();
    
    // More conservative width calculation to prevent overflow
    // Adding extra margin for x-axis labels and padding
    const chartWidth = width - 120; 
    
    // Data for the double bar chart - income and expenses
    const barData = [
        {
            value: 50,
            label: 'Mon',
            frontColor: '#00D09E', // Green for income
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 70,
            frontColor: '#0068FF', // Blue for expenses
        },
        {
            value: 80,
            label: 'Tue',
            frontColor: '#00D09E',
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 40,
            frontColor: '#0068FF',
        },
        {
            value: 30,
            label: 'Wed',
            frontColor: '#00D09E',
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 50,
            frontColor: '#0068FF',
        },
        {
            value: 70,
            label: 'Thu',
            frontColor: '#00D09E',
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 25,
            frontColor: '#0068FF',
        },
        {
            value: 100,
            label: 'Fri',
            frontColor: '#00D09E',
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 90,
            frontColor: '#0068FF',
        },
        {
            value: 20,
            label: 'Sat',
            frontColor: '#00D09E',
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 40,
            frontColor: '#0068FF',
        },
        {
            value: 75,
            label: 'Sun',
            frontColor: '#00D09E',
            spacing: 2,
            labelWidth: 30,
        },
        {
            value: 60,
            frontColor: '#0068FF',
        },
    ];

    return (
        <View className="mt-6 p-4 bg-violet-200 rounded-2xl shadow-md">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-psemibold text-black">Income & Expenses</Text>
                <View className="flex-row space-x-2">
                    <TouchableOpacity className="p-1.5 rounded-lg">
                        <MaterialCommunityIcons name="magnify" size={20} color="rgb(106, 13, 173)" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1.5 rounded-lg">
                        <MaterialCommunityIcons name="calendar-month-outline" size={20} color="rgb(106, 13, 173)" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-center space-x-6 mb-4">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-[#00D09E] mr-2" />
                    <Text className="text-xs text-gray-700">Income</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-[#0068FF] mr-2" />
                    <Text className="text-xs text-gray-700">Expenses</Text>
                </View>
            </View>

            {/* Chart with overflow hidden */}
            <View style={{ width: '100%', alignItems: 'center', overflow: 'hidden' }}>
                <BarChart
                    data={barData}
                    barWidth={10}
                    spacing={14} // Reduced spacing
                    roundedTop
                    hideRules
                    width={chartWidth}
                    xAxisThickness={1}
                    yAxisThickness={1}
                    yAxisTextStyle={{ color: 'gray' }}
                    xAxisLabelTextStyle={{ color: 'gray', textAlign: 'center', fontSize: 10 }}
                    noOfSections={5}
                    maxValue={120}
                    disableScroll={true}
                    yAxisLabelPrefix=""
                    yAxisLabelSuffix="k"
                    // Add horizontal padding to prevent overflow
                    horizontalRulesStyle={{ paddingRight: 10 }}
                    renderTooltip={(
                        item: {
                            value: number;
                            label?: string;
                            frontColor?: string;
                            spacing?: number;
                            labelWidth?: number;
                        },
                        index: number
                    ): React.ReactNode => {
                        return (
                            <View className="bg-gray-800 p-2 rounded">
                                <Text className="text-white text-xs">
                                    {index % 2 === 0 ? 'Income: ' : 'Expense: '}${item.value}k
                                </Text>
                            </View>
                        );
                    }}
                />
            </View>
        </View>
    )
}

export default AnalysisChart;
