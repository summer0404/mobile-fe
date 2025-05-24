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
        type: '',
        amount: '',
        debtor_name: '',
        detail: '',
        debt_date: new Date(),
        due_date: new Date(),
        status: '',
    });

    const [showDebtDate, setShowDebtDate] = useState(false);
    const [showDueDate, setShowDueDate] = useState(false);

    const [openType, setOpenType] = useState(false);
    const [typeValue, setTypeValue] = useState(null);
    const [typeItems, setTypeItems] = useState([
        { label: 'Lent', value: 'lend' },
        { label: 'Borrowed', value: 'borrow' },
    ]);

    const [openStatus, setOpenStatus] = useState(false);
    const [statusValue, setStatusValue] = useState(null);
    const [statusItems, setStatusItems] = useState([
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
    ]);

    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleAdd = async () => {
        setLoading(true);
        try {
            await fetch(`https://6829e5e9ab2b5004cb35235d.mockapi.io/debts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                }),
            });
            router.push('/(tabs)/debt');
        } catch (err) {
            console.error('Error adding debt:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
                        setValue={val => handleChange('type', val())}
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
                        setValue={val => handleChange('status', val())}
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
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add</Text>}
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
