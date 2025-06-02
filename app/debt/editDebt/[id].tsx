import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Pressable, ToastAndroid, SafeAreaView, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { handleGetDebt, handleUpdateDebt } from '../../../controller/DebtController';
import { TransactionStatus, TransactionType } from '@/constants/enum';
import GoBackToHomeHeader from '@/components/GoBackToHomeHeader';

export default function EditDebt() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    type: '',
    amount: '',
    debtorName: '',
    detail: '',
    date: new Date(),
    dueDate: new Date(),
    status: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDebtDate, setShowDebtDate] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  // Separate state for dropdown values
  const [typeValue, setTypeValue] = useState('');
  const [statusValue, setStatusValue] = useState('');

  const [typeItems, setTypeItems] = useState([
    { label: 'Borrow', value: 'borrow' },
    { label: 'Lend', value: 'lend' },
  ]);

  const [statusItems, setStatusItems] = useState([
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' }
  ]);

  const handleChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchDebt = async () => {
      try {
        const data = await handleGetDebt(id);
        const debtData = {
          name: data.name || '',
          type: data.type as TransactionType,
          amount: data.amount?.toString() || '',
          debtorName: data.debtorName || '',
          detail: data.detail || '',
          date: new Date(data.date),
          dueDate: new Date(data.dueDate),
          status: data.status || '',
        };
        
        setForm(debtData);
        // Set dropdown values separately
        setTypeValue(debtData.type);
        setStatusValue(debtData.status);
      } catch (err) {
        ToastAndroid.show('Failed to load debt', ToastAndroid.SHORT);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDebt();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await handleUpdateDebt(
        id,
        {
          name: form.name,
          type: typeValue as TransactionType, // Use dropdown state
          amount: parseFloat(form.amount),
          debtorName: form.debtorName,
          detail: form.detail,
          date: form.date.toISOString(),
          dueDate: form.dueDate?.toISOString() || null,
          status: statusValue as TransactionStatus, // Use dropdown state
        },
        () => router.back(),
        (err: any) => console.error(err)
      );
    } catch (err) {
      ToastAndroid.show('Error updating debt', ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={theme.colors.violet600} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className='p-6'>
        <GoBackToHomeHeader title='Edit Debt' />
      </View>

      {/* Content with ScrollView */}
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={val => handleChange('name', val)} />

          <Text style={styles.label}>Type</Text>
          <DropDownPicker
            listMode='MODAL'
            open={openType}
            setOpen={setOpenType}
            value={typeValue}
            setValue={setTypeValue}
            items={typeItems}
            setItems={setTypeItems}
            onChangeValue={(value) => {
              if (value) {
                handleChange('type', value);
              }
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={3000}
            zIndexInverse={2000}
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.amount}
            onChangeText={val => handleChange('amount', val)}
          />

          <Text style={styles.label}>Debtor Name</Text>
          <TextInput
            style={styles.input}
            value={form.debtorName}
            onChangeText={val => handleChange('debtorName', val)}
          />

          <Text style={styles.label}>Detail</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={form.detail}
            onChangeText={val => handleChange('detail', val)}
          />

          <View style={styles.dateWrapper}>
            <View style={styles.datePicker}>
              <Text style={styles.label}>Debt Date</Text>
              <TouchableOpacity onPress={() => setShowDebtDate(true)}>
                <TextInput
                  style={styles.input}
                  value={formatDate(form.date)}
                  editable={false}
                />
                <View style={{ position: 'absolute', top: 12, right: 10 }}>
                  <Ionicons name="calendar-outline" size={24} color="#666" />
                </View>
              </TouchableOpacity>
              {showDebtDate && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display="default"
                  onChange={(e, selectedDate) => {
                    setShowDebtDate(false);
                    if (selectedDate) handleChange('date', selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.datePicker}>
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity onPress={() => setShowDueDate(true)}>
                <TextInput
                  style={styles.input}
                  value={formatDate(form.dueDate)}
                  editable={false}
                />
                <View style={{ position: 'absolute', top: 12, right: 10 }}>
                  <Ionicons name="calendar-outline" size={24} color="#666" />
                </View>
              </TouchableOpacity>
              {showDueDate && (
                <DateTimePicker
                  value={form.dueDate}
                  mode="date"
                  display="default"
                  onChange={(e, selectedDate) => {
                    setShowDueDate(false);
                    if (selectedDate) handleChange('dueDate', selectedDate);
                  }}
                />
              )}
            </View>
          </View>

          <Text style={styles.label}>Status</Text>
          <DropDownPicker
            listMode='MODAL'
            open={openStatus}
            setOpen={setOpenStatus}
            value={statusValue}
            setValue={setStatusValue}
            items={statusItems}
            setItems={setStatusItems}
            onChangeValue={(value) => {
              if (value) {
                handleChange('status', value);
              }
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={2000}
            zIndexInverse={1000}
          />

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.violet600,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.violet600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#000', // Ensure text is visible
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  dateWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  datePicker: {
    flex: 1,
  },
  buttonWrapper: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 30,
  },
  button: {
    backgroundColor: theme.colors.violet600,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
