import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BarChart } from 'react-native-gifted-charts'

// Define a type for the props, specifically for the chart data
type ChartDataItem = {
    value: number;
    label?: string;
    frontColor?: string;
    spacing?: number;
    labelWidth?: number;
    // Add any other properties your data items might have for the chart
};

type AnalysisChartProps = {
    data: ChartDataItem[];
    // You could also pass maxValue as a prop if it needs to be dynamic
    // maxValue?: number; 
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ data /*, maxValue = 120 */ }) => {
    // Use useWindowDimensions hook for responsive sizing
    const { width } = useWindowDimensions();
    
    // More conservative width calculation to prevent overflow
    // Adding extra margin for x-axis labels and padding
    const chartWidth = width - 120; 
    
    // Determine a dynamic maxValue if not passed or if data exceeds current maxValue
    // This is a simple approach; you might want a more sophisticated one
    const calculatedMaxValue = React.useMemo(() => {
        if (!data || data.length === 0) return 120; // Default if no data
        const maxValInData = Math.max(...data.map(item => item.value), 0);
        return Math.ceil(Math.max(maxValInData, 10) / 10) * 10 + 10; // Ensure it's a bit higher than max value, rounded up
    }, [data]);

    return (
        <View className="mt-6 p-4 bg-violet-200 rounded-2xl shadow-md">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-psemibold text-black">Income & Expenses</Text>
                
                {/* <View className="flex-row space-x-2">
                    <TouchableOpacity className="p-1.5 rounded-lg">
                        <MaterialCommunityIcons name="magnify" size={20} color="rgb(106, 13, 173)" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-1.5 rounded-lg">
                        <MaterialCommunityIcons name="calendar-month-outline" size={20} color="rgb(106, 13, 173)" />
                    </TouchableOpacity>
                </View> */}
            </View>

            {/* Legend */}
            <View className="flex-row justify-center mb-4">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-[#00D09E] mr-2" />
                    <Text className="text-xs text-gray-700">Income</Text>
                </View>
                <View className="flex-row items-center ml-5">
                    <View className="w-3 h-3 rounded-full bg-[#0068FF] mr-2" />
                    <Text className="text-xs text-gray-700">Expenses</Text>
                </View>
            </View>

            {/* Chart with overflow hidden */}
            <View style={{ width: '100%', alignItems: 'center', overflow: 'hidden' }}>
                <BarChart
                    data={data} // Use the data prop here
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
                    maxValue={calculatedMaxValue} // Use the dynamic or passed maxValue
                    disableScroll={true}
                    yAxisLabelPrefix=""
                    yAxisLabelSuffix="k"
                    // Add horizontal padding to prevent overflow
                    horizontalRulesStyle={{ paddingRight: 10 }}
                    renderTooltip={(
                        item: ChartDataItem, // Use the defined ChartDataItem type
                        index: number
                    ): React.ReactNode => {
                        return (
                            <View className="bg-gray-800 p-2 rounded">
                                <Text className="text-white text-xs">
                                    {/* Assuming income is always even index and expense is odd */}
                                    {/* This logic depends on how data is structured in Analysis.tsx */}
                                    {index % 2 === 0 ? 'Income: ' : 'Expense: '}{item.value}k
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
