import { View, Text, TouchableOpacity, useWindowDimensions, Dimensions } from 'react-native'
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
    activeFilter?: string; // Add this to know which filter is active
};

const AnalysisChart: React.FC<AnalysisChartProps> = ({ data, activeFilter = 'Daily' }) => {
    // Check for empty data
    if (!data || data.length === 0) {
        return (
            <View className="mt-6 p-4 bg-violet-200 rounded-2xl shadow-md">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-psemibold text-black">Income & Expenses</Text>
                </View>
                <View className="items-center justify-center h-40">
                    <Text className="text-gray-500 text-center">No data available for the selected period</Text>
                </View>
            </View>
        );
    }

    const chartWidth = Dimensions.get('window').width - 80;
    
    // Calculate max value from the actual data (values are already in thousands)
    const maxDataValue = Math.max(...data.map(item => item.value || 0));
    
    // Set appropriate max value with some padding
    const calculatedMaxValue = Math.max(
        Math.ceil(maxDataValue * 1.2), // Add 20% padding
        5 // Minimum value of 5k to ensure chart is readable
    );

    console.log(`Chart maxValue calculation for ${activeFilter}:`, {
        maxDataValue,
        calculatedMaxValue,
        dataCount: data.length
    });

    const getChartConfig = () => {
        switch (activeFilter) {
            case 'Daily':
                return {
                    barWidth: 12,
                    spacing: 8,
                    chartWidth: chartWidth
                };
            case 'Weekly':
                return {
                    barWidth: 8,
                    spacing: 20,
                    chartWidth: chartWidth + 80 // More space for weekly labels
                };
            case 'Monthly':
                return {
                    barWidth: 15,
                    spacing: 12,
                    chartWidth: chartWidth
                };
            case 'Yearly':
                return {
                    barWidth: 16,
                    spacing: 25,
                    chartWidth: chartWidth + 60
                };
            default:
                return {
                    barWidth: 10,
                    spacing: 14,
                    chartWidth: chartWidth
                };
        }
    };

    const chartConfig = getChartConfig();

    return (
        <View className="mt-6 p-4 bg-violet-200 rounded-2xl shadow-md">
            <View className="mb-4">
                {/* Title on its own line */}
                <Text className="text-lg font-psemibold text-black mb-3">Income & Expenses</Text>
                
                {/* Legend on separate line */}
                <View className="flex-row items-center">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-green-400 rounded-full mr-2" />
                        <Text className="text-xs text-gray-600">Income</Text>
                    </View>
                    <View className="flex-row items-center ml-6">
                        <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                        <Text className="text-xs text-gray-600">Expenses</Text>
                    </View>
                </View>
            </View>

            <View style={{ width: '100%', alignItems: 'center', overflow: 'hidden' }}>
                <BarChart
                    data={data}
                    barWidth={chartConfig.barWidth}
                    spacing={chartConfig.spacing}
                    roundedTop
                    hideRules
                    width={chartConfig.chartWidth}
                    height={250} // Add explicit height
                    xAxisThickness={1}
                    yAxisThickness={1}
                    yAxisTextStyle={{ 
                        color: 'gray',
                        fontSize: 10,
                        width: 40, // Add explicit width for Y-axis labels
                    }}
                    xAxisLabelTextStyle={{ 
                        color: 'gray', 
                        textAlign: 'center', 
                        fontSize: (() => {
                            switch (activeFilter) {
                                case 'Weekly': return 9;
                                case 'Yearly': return 11;
                                default: return 10;
                            }
                        })(),
                        marginHorizontal: activeFilter === 'Weekly' ? 4 : 0,
                        paddingHorizontal: activeFilter === 'Weekly' ? 2 : 0
                    }}
                    noOfSections={5}
                    maxValue={calculatedMaxValue}
                    disableScroll={activeFilter === 'Daily' || activeFilter === 'Monthly'}
                    yAxisLabelPrefix=""
                    yAxisLabelSuffix="k"
                    yAxisLabelWidth={50} // Specific width for label text
                    leftShiftForTooltip={10} // Adjust tooltip position
                    leftShiftForLastIndexTooltip={10}
                    horizontalRulesStyle={{ paddingRight: 10 }}
                    initialSpacing={(() => {
                        switch (activeFilter) {
                            case 'Weekly': return 20; // Increased from 15
                            case 'Yearly': return 25; // Increased from 20
                            default: return 15; // Increased from 10
                        }
                    })()}
                    renderTooltip={(
                        item: ChartDataItem,
                        index: number
                    ): React.ReactNode => {
                        return (
                            <View style={{
                                marginBottom: 20,
                                marginLeft: -6,
                                backgroundColor: '#ffcefe',
                                paddingHorizontal: 6,
                                paddingVertical: 4,
                                borderRadius: 4,
                            }}>
                                <Text style={{ color: 'black', fontSize: 12 }}>
                                    {(item.value * 1000).toLocaleString()}
                                </Text>
                            </View>
                        );
                    }}
                />
            </View>
        </View>
    );
};

export default AnalysisChart;
