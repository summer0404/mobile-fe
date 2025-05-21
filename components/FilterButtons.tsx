import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

type FilterButtonsProps = {
  filters: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
};

const FilterButtons: React.FC<FilterButtonsProps> = ({filters, activeFilter, setActiveFilter}) => {
  return (
    <View className="flex-row justify-center items-center my-6 bg-violet-300 rounded-3xl p-1">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`flex-1 py-2.5 rounded-full ${
                  activeFilter === filter ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeFilter === filter ? 'text-textLight' : 'text-textDark/70'
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
  )
}

export default FilterButtons