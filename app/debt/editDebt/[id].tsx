import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Pressable, ToastAndroid
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import { handleGetDebt, handleUpdateDebt } from '../../../controller/DebtController';
import { TransactionStatus, TransactionType } from '@/app/constants/enum';

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

    const [typeItems, setTypeItems] = useState([
        { label: 'Income', value: 'income' },
        { label: 'Education', value: 'education' },
        { label: 'Food', value: 'food' },
        { label: 'Transport', value: 'transport' },
        { label: 'Groceries', value: 'groceries' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Beauty', value: 'beauty' },
        { label: 'Health', value: 'health' },
        { label: 'Vacation', value: 'vacation' },
        { label: 'Bill', value: 'bill' },
        { label: 'Home', value: 'home' },
        { label: 'Borrow', value: 'borrow' },
        { label: 'Lend', value: 'lend' },
        { label: 'Other', value: 'other' },
    ]);

    const [statusItems, setStatusItems] = useState([
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
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
        setForm({
          name: data.name || '',
          type: data.type || '',
          amount: data.amount?.toString() || '',
          debtorName: data.debtorName || '',
          detail: data.detail || '',
          date: new Date(data.date),
          dueDate: new Date(data.dueDate),
          status: data.status || '',
        });
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
          type: form.type as TransactionType,
          amount: parseFloat(form.amount),
          debtorName: form.debtorName,
          detail: form.detail,
          date: form.date.toISOString(),
          dueDate: form.dueDate?.toISOString() || null,
          status: form.status as TransactionStatus,
          userId: 1, // 🔧 TODO: lấy userId thực tế từ context/auth
        },
        () => router.back(),
        (err) => console.error(err)
      );
    } catch (err) {
      ToastAndroid.show('Error updating debt', ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6A4EFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Debt</Text>
        <Ionicons name="notifications" size={24} color="#fff" />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={val => handleChange('name', val)} />

        <Text style={styles.label}>Type</Text>
        <DropDownPicker
          open={openType}
          setOpen={setOpenType}
          value={form.type}
          setValue={val => handleChange('type', val)}
          items={typeItems}
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
          open={openStatus}
          setOpen={setOpenStatus}
          value={form.status}
          setValue={val => handleChange('status', val)}
          items={statusItems}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.violet600,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.colors.violet600,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loading: {
    backgroundColor: theme.colors.violet100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: theme.colors.violet100,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
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
  },
  button: {
    backgroundColor: theme.colors.violet600,
    padding: 15,
    borderRadius: 30,
    marginTop: 30,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
