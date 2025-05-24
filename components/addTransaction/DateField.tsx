// components/DateField.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Import event type

interface DateFieldProps {
  label: string;
  date: Date;
  onDateChange: (newDate: Date) => void;
  required?: boolean;
}

const DateField: React.FC<DateFieldProps> = ({ label, date, onDateChange, required = false }) => {
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    onDateChange(currentDate);
    if (Platform.OS !== 'ios') setShowPicker(false);
  };

  const formatDate = (dateToFormat: Date): string => {
    return `Today, ${dateToFormat.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`;
  };

  return (
    <View>
      <Text className="text-sm font-pmedium text-black mb-1.5">
        {label}
        {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="bg-[#F5F5F5] p-3.5 rounded-full flex-row justify-between items-center shadow-sm"
      >
        <Text className="text-black font-pregular">{formatDate(date)}</Text>
        <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#A0A0A0" />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default" // Or "spinner", "calendar", "clock"
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default DateField;