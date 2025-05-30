import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/utils/theme';
import CalendarIcon from '../../assets/images/calendar.svg';

export default function AddDebt() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        type: '' as TransactionType | '',
        amount: '',
        debtorName: '',
        detail: '',
        date: new Date(),
        dueDate: new Date(),
        status: '' as TransactionStatus | '',
        userId: 1,
    });

    const [showDate, setShowDate] = useState(false);
    const [showDueDate, setShowDueDate] = useState(false);
    const [openType, setOpenType] = useState(false);
    const [openStatus, setOpenStatus] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const isValidForm = () => {
        if (!form.name.trim() || !form.amount.trim() || isNaN(parseFloat(form.amount))) {
            ToastAndroid.show('Name and amount must be valid.', ToastAndroid.SHORT);
            return false;
        }
        if (!form.type || !form.status) {
            ToastAndroid.show('Please select type and status.', ToastAndroid.SHORT);
            return false;
        }
        return true;
    };

    const handleAdd = async () => {
        if (!isValidForm()) return;

        setLoading(true);

        const payload = {
            ...form,
            type: form.type as TransactionType,
            status: form.status as TransactionStatus,
            amount: parseFloat(form.amount),
            date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
            dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        };

        await handleAddDebt(
            payload,
            () => {
                setLoading(false);
                router.push('/(tabs)/debt');
            },
            () => {
                setLoading(false);
                ToastAndroid.show('Error adding debt', ToastAndroid.SHORT);
            }
        );
    };

    return (
        <ScrollView style={styles.container} nestedScrollEnabled={true}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Add Debt</Text>
                <Ionicons name="notifications" size={24} color="#fff" />
            </View>

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
                        setValue={callback => {
                            const val = callback(form.type);
                            handleChange('type', val);
                            return val;
                        }}
                        zIndex={3000}
                        zIndexInverse={2000}
                        textStyle={styles.inputOption}
                        placeholder='Select type'
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
                    value={form.debtor_name}
                    onChangeText={val => handleChange('debtor_name', val)}
                    placeholder='Enter debtor name here'
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

                    <View style={[styles.datePicker, { position: 'relative' }]}>
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

                <View style={{ zIndex: 1000 }} >
                    <Text style={styles.label}>Status</Text>
                    <DropDownPicker
                        listMode="SCROLLVIEW"
                        open={openStatus}
                        setOpen={setOpenStatus}
                        items={statusItems}
                        setItems={setStatusItems}
                        value={form.status}
                        setValue={callback => {
                            const val = callback(form.status);
                            handleChange('status', val);
                            return val;
                        }}
                        zIndex={2000}
                        zIndexInverse={2000}
                        textStyle={styles.inputOption}
                        placeholder='Select status'
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleAdd}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>Add</Text>}
                    </TouchableOpacity>
                </View>
                <View style={{ height: 30 }} />
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
    content: {
        height: '100%',
        padding: 30,
        paddingTop: 30,
        backgroundColor: theme.colors.violet100,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },
    label: {
        marginTop: 10,
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
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
    datePicker: {
        marginTop: 10,
    },
    buttonWrapper: {
        flexDirection: 'row',
        gap: '5%',
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
