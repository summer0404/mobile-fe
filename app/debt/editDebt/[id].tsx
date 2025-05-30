import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Pressable, ToastAndroid
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import CalendarIcon from '../../../assets/images/calendar.svg';

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

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={val => handleChange('name', val)}
                    placeholder='Enter name here'
                />

                <View style={{ zIndex: 2000 }}>
                    <Text style={styles.label}>Type</Text>
                    <DropDownPicker
                        listMode="SCROLLVIEW"
                        open={openType}
                        setOpen={setOpenType}
                        items={typeItems}
                        setItems={setTypeItems}
                        value={form.type}
                        setValue={val => handleChange('type', val())}
                        zIndex={3000}
                        zIndexInverse={2000}
                        textStyle={styles.inputOption}
                    />

                </View>


                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={form.amount}
                    onChangeText={val => handleChange('amount', val)}
                    placeholder='Enter amount here'
                />

        <Text style={styles.label}>Debtor Name</Text>
        <TextInput
          style={styles.input}
          value={form.debtorName}
          onChangeText={val => handleChange('debtorName', val)}
        />

                <Text style={styles.label}>Detail</Text>
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    multiline={true}
                    value={form.detail}
                    onChangeText={val => handleChange('detail', val)}
                    placeholder="Enter detail here"
                />

                <View style={styles.dateWrapper}>
                    <View style={styles.datePicker}>
                        <Text style={styles.label}>Debt Date</Text>
                        <TouchableOpacity onPress={() => setShowDebtDate(true)}>
                            <TextInput
                                style={[styles.input]}
                                value={formatDate(form.debt_date)}
                                editable={false}
                            />
                            <View style={{ position: 'absolute', top: 12, right: 10 }}>
                                <CalendarIcon width={24} height={24} />
                            </View>
                        </TouchableOpacity>
                        {showDebtDate && (
                            <DateTimePicker
                                value={form.debt_date}
                                mode="date"
                                display="default"
                                onChange={(e, selectedDate) => {
                                    setShowDebtDate(false);
                                    if (selectedDate) handleChange('debt_date', selectedDate);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.datePicker}>
                        <Text style={styles.label}>Due Date</Text>
                        <TouchableOpacity onPress={() => setShowDueDate(true)}>
                            <TextInput
                                style={[styles.input]}
                                value={formatDate(form.due_date)}
                                editable={false}
                            />
                            <View style={{ position: 'absolute', top: 12, right: 10 }}>
                                <CalendarIcon width={24} height={24} />
                            </View>
                        </TouchableOpacity>
                        {showDueDate && (
                            <DateTimePicker
                                value={form.due_date}
                                mode="date"
                                display="compact"
                                onChange={(e, selectedDate) => {
                                    setShowDueDate(false);
                                    if (selectedDate) handleChange('due_date', selectedDate);
                                }}
                            />
                        )}
                    </View>
                </View>

                <View style={{ zIndex: 1000 }}>
                    <Text style={styles.label}>Status</Text>
                    <DropDownPicker
                        listMode="SCROLLVIEW"
                        open={openStatus}
                        setOpen={setOpenStatus}
                        items={statusItems}
                        setItems={setStatusItems}
                        value={form.status}
                        setValue={val => handleChange('status', val())}
                        zIndex={2000}
                        zIndexInverse={2000}
                        textStyle={styles.inputOption}
                    />
                </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        {loadingAdd ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
                    </TouchableOpacity>
                </View>
                <View style={{ height: 20 }} />
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
        padding: 30,
        paddingBottom: 16,
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
    },
    loading: {
        backgroundColor: theme.colors.violet100,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        height: '100%',
        padding: 30,
        paddingTop: 30,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: theme.colors.greenText,
        marginTop: 10,
        marginBottom: 0,
    },
    input: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        lineHeight: 18,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        height: 50,
        borderRadius: 10,
    },
    inputOption: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        lineHeight: 16,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    dateWrapper: {
        flexDirection: 'row',
        gap: '5%',
    },
    buttonWrapper: {
        flexDirection: 'row',
        gap: '5%',
        justifyContent: 'center',
    },
    datePicker: {
        flex: 1,
    },
    button: {
        backgroundColor: theme.colors.violet600,
        padding: 15,
        borderRadius: 30,
        marginTop: 30,
        alignItems: 'center',
        minWidth: 100,
    },
    buttonText: { color: '#fff', fontWeight: '600' },
});
